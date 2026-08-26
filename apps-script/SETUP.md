# Apps Script 表單防護部署順序

這份 Apps Script 版本搭配網站內的 Cloudflare Turnstile 使用。網站端與 Apps Script 端必須同時完成，只有前端 Widget 無法阻止直接呼叫公開端點的機器人。

## 一、確認指令碼屬性

在 Apps Script 的「專案設定」→「指令碼屬性」確認存在：

- `SPREADSHEET_ID`：既有 Google Sheet ID
- `TURNSTILE_SECRET`：Cloudflare Turnstile 提供的 Secret Key

Secret Key 不可寫入 `Code.gs`、網站 HTML 或 GitHub。

## 二、更新 Apps Script

1. 先備份目前 Apps Script 程式碼。
2. 以本資料夾的 `Code.gs` 完整取代 Apps Script 編輯器中的舊版本。
3. 儲存專案。
4. 不要另外建立新的 Web App 網址；請開啟「部署」→「管理部署作業」。
5. 編輯目前網站使用的既有部署，版本選擇「新版本」，再按「部署」。
6. 保持「執行身分：我」以及原本允許網站訪客使用的存取設定。
7. 部署後以瀏覽器開啟既有的 `/exec` 網址，確認回傳內容包含 `"version":"2026-08-26-v2"`。若沒有這段文字，代表既有部署仍在執行舊版本。

更新既有部署可以保留目前五個網站表單使用的 `/exec` 網址，也避免舊的未受保護端點繼續運作。

## 三、部署網站

Apps Script 新版本部署成功後，才合併包含 Turnstile Widget 的網站 PR。請勿顛倒順序，否則網站表單會暫時無法正確顯示伺服器回覆。

## 四、正式測試

網站部署後，依序測試：

1. 首頁詢問表單
2. 聯絡頁表單
3. 自動電池點焊機產品頁表單
4. 電芯分選機產品頁表單
5. 產品及服務頁表單

每頁各送出一次測試資料，確認：

- Turnstile 顯示並完成驗證。
- 送出後顯示成功訊息。
- Google Sheet 只新增一筆資料。
- 通知信寄至 `hst2872@hxiang.com.tw`。
- 相同內容立即再次送出時，不會新增第二筆資料或寄出第二封信。

測試完成後，可刪除 Google Sheet 中的測試資料。
