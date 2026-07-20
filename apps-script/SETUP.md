# Website enquiry capture setup / 網站詢問紀錄設定

This folder lets the existing website form save an enquiry to Google Sheets and email a notification to `hst2872@hxiang.com.tw`.

本資料夾讓現有網站表單把詢問資料存到 Google 試算表，並通知 `hst2872@hxiang.com.tw`。

## 1. Create the spreadsheet / 建立試算表

1. Open [Google Sheets](https://sheets.google.com) and create a blank spreadsheet named `鴻翔網站詢問`.
2. Copy the spreadsheet ID from its URL. It is the value between `/d/` and `/edit`.

1. 開啟 [Google Sheets](https://sheets.google.com)，建立空白試算表並命名為 `鴻翔網站詢問`。
2. 從網址複製試算表 ID；它位於 `/d/` 與 `/edit` 之間。

## 2. Create the Apps Script project / 建立 Apps Script 專案

1. In the spreadsheet, select **Extensions → Apps Script**.
2. Replace the default file contents with [`Code.gs`](Code.gs).
3. Save the project with the name `鴻翔網站詢問接收器`.

1. 在試算表中選擇「擴充功能 → Apps Script」。
2. 將預設程式碼全部換成 [`Code.gs`](Code.gs) 的內容。
3. 將專案命名為「鴻翔網站詢問接收器」並儲存。

## 3. Add the spreadsheet ID privately / 私下設定試算表 ID

1. In Apps Script, select **Project Settings**.
2. Under **Script Properties**, add a property named `SPREADSHEET_ID`.
3. Paste the spreadsheet ID as its value and save.

This keeps the ID out of the public GitHub repository.

1. 在 Apps Script 選擇「專案設定」。
2. 在「指令碼屬性」新增名稱為 `SPREADSHEET_ID` 的屬性。
3. 貼上試算表 ID 作為值並儲存。

這樣試算表 ID 就不會出現在公開的 GitHub 倉庫中。

## 4. Deploy the web app / 部署 Web App

1. Select **Deploy → New deployment → Web app**.
2. Set **Execute as** to **Me**.
3. Set access to **Anyone** so that website visitors do not need to sign in.
4. Click **Deploy**, complete Google authorization, then copy the URL ending in `/exec`.

1. 選擇「部署 → 新增部署 → 網頁應用程式」。
2. 將「執行身分」設為「我」。
3. 將存取權設為「任何人」，客戶才不需要登入 Google 才能送出表單。
4. 按「部署」，完成 Google 授權後，複製結尾是 `/exec` 的網址。

## 5. Connect the website / 串接網站

Do not paste the URL in this public document. Send the `/exec` URL to Codex in this chat. A small follow-up pull request will connect the website form to it and add a visible privacy notice.

不要把網址貼進這個公開文件。請把 `/exec` 網址傳給 Codex；下一個小型 PR 會把現有網站表單串接到它，並加入可見的隱私權告知。

## What the spreadsheet records / 試算表會記錄什麼

`收到時間｜公司名稱｜聯絡人｜電話｜Email｜需求類別｜需求說明｜處理狀態｜下一步`

Suggested status values: `新詢問 / 已聯絡 / 報價中 / 成交 / 未成交`.

建議的處理狀態：`新詢問 / 已聯絡 / 報價中 / 成交 / 未成交`。

## Notes / 注意事項

- The form has a hidden honeypot field to reduce simple spam. It is not a replacement for a full anti-spam service.
- The Apps Script deployment URL must be public because the website itself is public. It does not grant visitors access to your spreadsheet.
- Do not share the spreadsheet or Apps Script project with people who do not need access.

- 表單含有隱藏的防垃圾訊息欄位，可減少簡單機器人訊息，但不能取代完整防垃圾服務。
- Apps Script 部署網址必須公開，因為網站本身公開；但這不會讓訪客取得試算表存取權。
- 請不要把試算表或 Apps Script 專案分享給不需要存取的人。
