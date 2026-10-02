// Build AI Lab — feedback receiver. Paste this into the sheet's Apps Script editor.
//
// Setup (once, about 5 minutes):
// 1. Open the sheet "Build AI Lab – Feedback" → Extensions → Apps Script.
// 2. Replace everything in Code.gs with this file. Save.
// 3. Project Settings (gear) → Script properties → Add property:
//      FEEDBACK_TOKEN = a long random string (the same value goes into Vercel).
// 4. Deploy → New deployment → type: Web app.
//      Execute as: Me.   Who has access: Anyone.   Deploy, and allow access.
// 5. Copy the Web app URL. In Vercel → Project → Settings → Environment Variables add:
//      FEEDBACK_URL   = the Web app URL
//      FEEDBACK_TOKEN = the same random string as step 3
//    Then push or redeploy, so the new variables are used.
//
// "Anyone" can reach the URL, but only requests carrying the token are saved,
// and only the site's server knows the token.

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var expected = PropertiesService.getScriptProperties().getProperty("FEEDBACK_TOKEN");
    if (!expected || body.token !== expected) return reply({ ok: false, error: "unauthorised" });

    var row = (body.row || []).slice(0, 7).map(function (v) {
      var s = String(v == null ? "" : v).slice(0, 2000);
      // A cell starting with = + - or @ would run as a formula. Store it as text instead.
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    });
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow(row);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
