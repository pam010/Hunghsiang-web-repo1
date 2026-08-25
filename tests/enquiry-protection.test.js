const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const status = { textContent: '', dataset: {} };
const label = { textContent: '送出評估需求', dataset: {} };
const button = {
  disabled: false,
  querySelector(selector) { return selector === 'span' ? label : null; }
};
const widget = { scrollIntoView() {} };
const frame = {};
const fields = {
  'cf-turnstile-response': { name: 'cf-turnstile-response', value: 'valid-token' }
};
let busy = false;
let resetCount = 0;
let submitHandler;
let domReadyHandler;
let messageHandler;
let turnstileResetCount = 0;

const form = {
  target: 'enquiry-response',
  elements: { namedItem(name) { return fields[name] || null; } },
  querySelector(selector) {
    return {
      '[role="status"]': status,
      'button[type="submit"]': button,
      '.cf-turnstile': widget
    }[selector] || null;
  },
  appendChild(field) { fields[field.name] = field; },
  toggleAttribute(name, enabled) { if (name === 'aria-busy') busy = enabled; },
  addEventListener(type, handler) { if (type === 'submit') submitHandler = handler; },
  reset() { resetCount += 1; }
};

const document = {
  querySelector(selector) {
    return selector === 'iframe[name="enquiry-response"]' ? frame : null;
  },
  querySelectorAll(selector) {
    return selector === '[data-enquiry-form]' ? [form] : [];
  },
  createElement() { return {}; },
  addEventListener(type, handler) { if (type === 'DOMContentLoaded') domReadyHandler = handler; }
};

const window = {
  crypto: { randomUUID() { return 'request-123'; } },
  turnstile: { reset() { turnstileResetCount += 1; } },
  matchMedia() { return { matches: false }; },
  setTimeout() { return 1; },
  clearTimeout() {},
  addEventListener(type, handler) { if (type === 'message') messageHandler = handler; }
};

const context = vm.createContext({ document, window, navigator: { onLine: true }, URL, Map });
const scriptPath = path.join(__dirname, '..', 'enquiry-protection.js');
vm.runInContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });

domReadyHandler();
submitHandler({ preventDefault() {}, stopImmediatePropagation() {} });

assert.equal(fields.submissionId.value, 'request-123');
assert.equal(button.disabled, true);
assert.equal(busy, true);
assert.match(status.textContent, /正在進行安全驗證/);

messageHandler({
  origin: 'https://script.googleusercontent.com',
  data: {
    type: 'hung-hsiang-enquiry-response',
    ok: true,
    requestId: 'different-request'
  }
});
assert.equal(button.disabled, true, 'a response with the wrong request ID must be ignored');

messageHandler({
  origin: 'https://script.googleusercontent.com',
  data: {
    type: 'hung-hsiang-enquiry-response',
    ok: true,
    requestId: 'request-123'
  }
});

assert.equal(button.disabled, false);
assert.equal(busy, false);
assert.equal(resetCount, 1);
assert.equal(turnstileResetCount, 1);
assert.match(status.textContent, /已收到您的詢問/);

console.log('Enquiry protection response tests passed.');
