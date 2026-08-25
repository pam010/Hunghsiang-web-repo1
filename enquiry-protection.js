(() => {
  const RESPONSE_TYPE = 'hung-hsiang-enquiry-response';
  const TURNSTILE_FIELD = 'cf-turnstile-response';
  const SUBMIT_TIMEOUT_MS = 20000;
  const pendingForms = new Map();

  const getStatus = form => form.querySelector('[role="status"]');
  const getSubmitButton = form => form.querySelector('button[type="submit"]');
  const getSubmitLabel = form => getSubmitButton(form)?.querySelector('span');
  const getResponseFrame = form => {
    if (!form.target) return null;
    return document.querySelector(`iframe[name="${form.target}"]`);
  };

  const setStatus = (form, message, isError = false) => {
    const status = getStatus(form);
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'normal';
  };

  const setPending = (form, pending) => {
    const button = getSubmitButton(form);
    const label = getSubmitLabel(form);
    form.toggleAttribute('aria-busy', pending);
    if (button) button.disabled = pending;
    if (label) {
      label.textContent = pending
        ? '送出中…'
        : (label.dataset.defaultLabel || '送出評估需求');
    }
  };

  const clearPending = form => {
    const pending = pendingForms.get(form);
    if (pending?.timer) window.clearTimeout(pending.timer);
    pendingForms.delete(form);
    setPending(form, false);
  };

  const resetTurnstile = () => {
    if (window.turnstile && typeof window.turnstile.reset === 'function') {
      window.turnstile.reset();
    }
  };

  const hasTurnstileToken = form => {
    const field = form.elements.namedItem(TURNSTILE_FIELD);
    return Boolean(field && String(field.value || '').trim());
  };

  const focusVerification = form => {
    const widget = form.querySelector('.cf-turnstile');
    if (!widget) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    widget.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };

  const handleSubmit = (form, event) => {
    if (!navigator.onLine) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setStatus(form, '目前無法連線。請確認網路後再試一次，或改用電話 03-369-5689 與 Email 聯絡。', true);
      return;
    }

    if (!hasTurnstileToken(form)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setStatus(form, '安全驗證尚未完成，請稍候並確認驗證區塊後再送出。', true);
      focusVerification(form);
      return;
    }

    const frame = getResponseFrame(form);
    if (!frame) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setStatus(form, '表單目前無法送出，請改用電話 03-369-5689 或 Email 聯絡。', true);
      return;
    }

    setStatus(form, '正在進行安全驗證並送出，請稍候…');
    setPending(form, true);

    const timer = window.setTimeout(() => {
      clearPending(form);
      resetTurnstile();
      setStatus(form, '送出時間較長，請稍後再試一次。您填寫的內容仍保留在表單中。', true);
    }, SUBMIT_TIMEOUT_MS);

    pendingForms.set(form, { frame, timer });
  };

  const isTrustedAppsScriptOrigin = origin => {
    try {
      const hostname = new URL(origin).hostname;
      return hostname === 'script.google.com' || hostname.endsWith('.googleusercontent.com');
    } catch {
      return false;
    }
  };

  window.addEventListener('message', event => {
    if (!isTrustedAppsScriptOrigin(event.origin) || event.data?.type !== RESPONSE_TYPE) return;

    const match = Array.from(pendingForms.entries()).find(([, pending]) => (
      pending.frame?.contentWindow === event.source
    ));
    if (!match) return;

    const [form] = match;
    clearPending(form);
    resetTurnstile();

    if (event.data.ok) {
      form.reset();
      setStatus(form, '已收到您的詢問，鴻翔團隊將在營業時間內盡快與您聯繫。');
      return;
    }

    const message = event.data.error === 'verification_failed'
      ? '安全驗證失敗，請重新完成驗證後再送出。'
      : '目前無法儲存詢問，請稍後再試一次。您填寫的內容仍保留在表單中。';
    setStatus(form, message, true);
  });

  window.onEnquiryTurnstileSuccess = () => {
    document.querySelectorAll('[data-enquiry-form]').forEach(form => {
      const status = getStatus(form);
      if (status?.textContent.includes('安全驗證')) setStatus(form, '安全驗證已完成，可以送出表單。');
    });
  };

  window.onEnquiryTurnstileExpired = () => {
    document.querySelectorAll('[data-enquiry-form]').forEach(form => {
      setStatus(form, '安全驗證已逾時，請重新完成驗證後再送出。', true);
    });
  };

  window.onEnquiryTurnstileError = () => {
    document.querySelectorAll('[data-enquiry-form]').forEach(form => {
      setStatus(form, '安全驗證暫時無法完成，請稍後重試或重新整理頁面。', true);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-enquiry-form]').forEach(form => {
      const label = getSubmitLabel(form);
      if (label) label.dataset.defaultLabel = label.textContent.trim();
      form.addEventListener('submit', event => handleSubmit(form, event), true);
    });
  });
})();
