const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rows = [];
const emails = [];
const cache = new Map();
let turnstileResult = { success: false, 'error-codes': ['invalid-input-response'] };

const sheet = {
  appendRow(row) { rows.push(row); },
  getLastRow() { return rows.length; },
  setFrozenRows() {}
};

const context = vm.createContext({
  console: { ...console, warn() {}, error() {} },
  PropertiesService: {
    getScriptProperties() {
      return {
        getProperty(name) {
          return {
            SPREADSHEET_ID: 'test-sheet',
            TURNSTILE_SECRET: 'test-secret'
          }[name] || null;
        }
      };
    }
  },
  SpreadsheetApp: {
    openById() {
      return {
        getSheetByName() { return sheet; },
        insertSheet() { return sheet; }
      };
    }
  },
  CacheService: {
    getScriptCache() {
      return {
        get(key) { return cache.get(key) || null; },
        put(key, value) { cache.set(key, value); }
      };
    }
  },
  LockService: {
    getScriptLock() {
      return { tryLock() { return true; }, releaseLock() {} };
    }
  },
  UrlFetchApp: {
    fetch() {
      return {
        getResponseCode() { return 200; },
        getContentText() { return JSON.stringify(turnstileResult); }
      };
    }
  },
  Utilities: {
    DigestAlgorithm: { SHA_256: 'sha256' },
    Charset: { UTF_8: 'utf8' },
    computeDigest(_algorithm, value) {
      return Array.from(crypto.createHash('sha256').update(value, 'utf8').digest())
        .map(byte => (byte > 127 ? byte - 256 : byte));
    },
    formatDate() { return '2026-08-26 12:00'; }
  },
  Session: { getScriptTimeZone() { return 'Asia/Taipei'; } },
  MailApp: { sendEmail(message) { emails.push(message); } },
  HtmlService: {
    XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' },
    createHtmlOutput(html) {
      return {
        html,
        setXFrameOptionsMode() { return this; }
      };
    }
  },
  ContentService: {
    MimeType: { JSON: 'JSON' },
    createTextOutput(text) {
      return { text, setMimeType() { return this; } };
    }
  }
});

const codePath = path.join(__dirname, '..', 'apps-script', 'Code.gs');
vm.runInContext(fs.readFileSync(codePath, 'utf8'), context, { filename: codePath });

const baseParameters = {
  company: 'Test Company',
  contactName: 'Test Contact',
  phone: '03-369-5689',
  email: 'test@example.com',
  inquiryType: '索取標準機型規格書',
  message: 'Test enquiry',
  'cf-turnstile-response': 'test-token'
};

const rejected = context.doPost({
  parameter: { ...baseParameters, submissionId: 'request-rejected' }
});
assert.match(rejected.html, /window\.top\.postMessage/);
assert.match(rejected.html, /https:\/\/www\.hongxiang-taoyuan\.com/);
assert.match(rejected.html, /request-rejected/);
assert.match(rejected.html, /verification_failed/);
assert.equal(rows.length, 0);
assert.equal(emails.length, 0);

turnstileResult = {
  success: true,
  hostname: 'www.hongxiang-taoyuan.com',
  action: 'enquiry'
};
const accepted = context.doPost({
  parameter: { ...baseParameters, submissionId: 'request-accepted' }
});
assert.match(accepted.html, /request-accepted/);
assert.match(accepted.html, /"ok":true/);
assert.equal(rows.length, 2);
assert.equal(emails.length, 1);

const duplicate = context.doPost({
  parameter: { ...baseParameters, submissionId: 'request-duplicate' }
});
assert.match(duplicate.html, /request-duplicate/);
assert.match(duplicate.html, /"duplicate":true/);
assert.equal(rows.length, 2);
assert.equal(emails.length, 1);

const health = context.doGet();
assert.match(health.text, /2026-08-26-v2/);

console.log('Apps Script enquiry tests passed.');
