/**
 * Hung Hsiang website enquiry receiver.
 *
 * Required script properties:
 * - SPREADSHEET_ID
 * - TURNSTILE_SECRET
 *
 * Never put either value directly in this file.
 */
const ENQUIRY_SETTINGS = {
  sheetName: '網站詢問',
  notificationEmail: 'hst2872@hxiang.com.tw',
  headers: ['收到時間', '公司名稱', '聯絡人', '電話', 'Email', '需求類別', '需求說明', '處理狀態', '下一步'],
  allowedHostnames: ['hongxiang-taoyuan.com', 'www.hongxiang-taoyuan.com'],
  turnstileAction: 'enquiry',
  duplicateWindowSeconds: 21600
};

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Hung Hsiang enquiry receiver',
    version: '2026-08-26-v2'
  });
}

function doPost(event) {
  const values = event && event.parameter ? event.parameter : {};
  const requestId = clean_(values.submissionId, 100);

  try {
    // A hidden field catches simple automated bots. Real visitors never see it.
    if (clean_(values.website, 200)) {
      return formResponse_({ ok: true, requestId: requestId });
    }

    verifyTurnstile_(clean_(values['cf-turnstile-response'], 2048));

    const enquiry = {
      company: clean_(values.company, 120),
      contactName: clean_(values.contactName, 80),
      phone: clean_(values.phone, 50),
      email: clean_(values.email, 120),
      inquiryType: clean_(values.inquiryType, 100),
      message: clean_(values.message, 3000)
    };

    validate_(enquiry);

    const now = new Date();
    const duplicate = appendEnquiryUnlessDuplicate_(enquiry, now);
    if (duplicate) {
      return formResponse_({ ok: true, duplicate: true, requestId: requestId });
    }

    try {
      sendNotification_(enquiry, now);
    } catch (notificationError) {
      // Keep the saved enquiry even if the email service is temporarily unavailable.
      console.error('The enquiry was saved, but the notification email failed.', notificationError);
    }

    return formResponse_({ ok: true, requestId: requestId });
  } catch (error) {
    console.error(error);
    return formResponse_({
      ok: false,
      error: error && error.code === 'verification_failed'
        ? 'verification_failed'
        : 'submission_failed',
      requestId: requestId
    });
  }
}

function verifyTurnstile_(token) {
  if (!token) {
    throw codedError_('verification_failed', 'Missing Turnstile token.');
  }

  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) {
    throw new Error('Missing TURNSTILE_SECRET script property.');
  }

  let response;
  try {
    response = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'post',
      payload: {
        secret: secret,
        response: token
      },
      muteHttpExceptions: true
    });
  } catch (requestError) {
    throw new Error('Unable to contact Turnstile Siteverify. ' + requestError.message);
  }

  if (response.getResponseCode() !== 200) {
    throw new Error('Turnstile Siteverify returned HTTP ' + response.getResponseCode() + '.');
  }

  let result;
  try {
    result = JSON.parse(response.getContentText());
  } catch (parseError) {
    throw new Error('Turnstile Siteverify returned invalid JSON.');
  }

  const validHostname = ENQUIRY_SETTINGS.allowedHostnames.indexOf(result.hostname) !== -1;
  const validAction = result.action === ENQUIRY_SETTINGS.turnstileAction;
  if (!result.success || !validHostname || !validAction) {
    console.warn('Turnstile rejected a submission.', JSON.stringify({
      success: Boolean(result.success),
      hostname: result.hostname || '',
      action: result.action || '',
      errorCodes: result['error-codes'] || []
    }));
    throw codedError_('verification_failed', 'Turnstile verification failed.');
  }
}

function appendEnquiryUnlessDuplicate_(enquiry, receivedAt) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Unable to acquire the enquiry write lock.');
  }

  try {
    const cache = CacheService.getScriptCache();
    const duplicateKey = 'enquiry:' + sha256_([
      enquiry.company.toLowerCase(),
      enquiry.contactName.toLowerCase(),
      enquiry.phone.replace(/\D/g, ''),
      enquiry.email.toLowerCase(),
      enquiry.inquiryType.toLowerCase(),
      enquiry.message.toLowerCase()
    ].join('|'));

    if (cache.get(duplicateKey)) return true;

    const sheet = getSheet_();
    sheet.appendRow([
      receivedAt,
      forSheet_(enquiry.company),
      forSheet_(enquiry.contactName),
      forSheet_(enquiry.phone),
      forSheet_(enquiry.email),
      forSheet_(enquiry.inquiryType),
      forSheet_(enquiry.message),
      '新詢問',
      ''
    ]);

    cache.put(duplicateKey, '1', ENQUIRY_SETTINGS.duplicateWindowSeconds);
    return false;
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('Missing SPREADSHEET_ID script property.');
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(ENQUIRY_SETTINGS.sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(ENQUIRY_SETTINGS.sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ENQUIRY_SETTINGS.headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function validate_(enquiry) {
  if (!enquiry.company || !enquiry.contactName || !enquiry.email || !enquiry.inquiryType) {
    throw new Error('Required enquiry fields are missing.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    throw new Error('Email address is invalid.');
  }
}

function sendNotification_(enquiry, receivedAt) {
  const timezone = Session.getScriptTimeZone() || 'Asia/Taipei';
  const receivedTime = Utilities.formatDate(receivedAt, timezone, 'yyyy-MM-dd HH:mm');
  const body = [
    '新的網站詢問',
    '',
    '收到時間：' + receivedTime,
    '公司名稱：' + enquiry.company,
    '聯絡人：' + enquiry.contactName,
    '電話：' + (enquiry.phone || '未填寫'),
    'Email：' + enquiry.email,
    '需求類別：' + enquiry.inquiryType,
    '需求說明：' + (enquiry.message || '未填寫')
  ].join('\n');

  MailApp.sendEmail({
    to: ENQUIRY_SETTINGS.notificationEmail,
    subject: '[鴻翔網站] 新詢問｜' + enquiry.company,
    body: body,
    replyTo: enquiry.email,
    name: '鴻翔網站詢問系統'
  });
}

function clean_(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function forSheet_(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function sha256_(value) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8
  );
  return digest.map(function(byte) {
    return ((byte + 256) % 256).toString(16).padStart(2, '0');
  }).join('');
}

function codedError_(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function formResponse_(payload) {
  const message = Object.assign({ type: 'hung-hsiang-enquiry-response' }, payload);
  const safeJson = JSON.stringify(message)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  const html = '<!doctype html><html><head><meta charset="UTF-8"></head><body>' +
    '<script>window.top.postMessage(' + safeJson + ', "https://www.hongxiang-taoyuan.com");<\/script>' +
    '</body></html>';

  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
