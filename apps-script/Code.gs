/**
 * Hung Hsiang website enquiry receiver.
 *
 * Before deploying, set the SPREADSHEET_ID script property as described in
 * SETUP.md. Do not put the spreadsheet ID directly in this file.
 */
const ENQUIRY_SETTINGS = {
  sheetName: '網站詢問',
  notificationEmail: 'hst2872@hxiang.com.tw',
  headers: ['收到時間', '公司名稱', '聯絡人', '電話', 'Email', '需求類別', '需求說明', '處理狀態', '下一步']
};

function doGet() {
  return jsonResponse_({ ok: true, service: 'Hung Hsiang enquiry receiver' });
}

function doPost(event) {
  try {
    const values = event && event.parameter ? event.parameter : {};

    // A hidden field catches simple automated bots. Real visitors never see it.
    if (clean_(values.website, 200)) {
      return jsonResponse_({ ok: true });
    }

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
    const sheet = getSheet_();
    sheet.appendRow([
      now,
      enquiry.company,
      enquiry.contactName,
      enquiry.phone,
      enquiry.email,
      enquiry.inquiryType,
      enquiry.message,
      '新詢問',
      ''
    ]);

    sendNotification_(enquiry, now);
    return jsonResponse_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: 'Unable to save this enquiry.' });
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
  if (!enquiry.company || !enquiry.contactName || !enquiry.phone || !enquiry.email) {
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
    '電話：' + enquiry.phone,
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

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
