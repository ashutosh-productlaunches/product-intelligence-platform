// POST /api/feedback — saves one piece of feedback to the Google Sheet.
//
// The browser never talks to Google. It sends the form here; this server route
// checks it with Zod, then forwards one row to a small Google Apps Script that
// appends it to the sheet (docs/feedback-apps-script.gs). The script's URL and
// a shared secret live in environment variables, so only this server can write.
import { Feedback, toRow } from "@/lib/feedback";

export async function POST(request: Request) {
  const url = process.env.FEEDBACK_URL;
  const token = process.env.FEEDBACK_TOKEN;
  if (!url || !token) {
    return Response.json({ ok: false, error: "Feedback isn't connected yet." }, { status: 503 });
  }

  const parsed = Feedback.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 });
  }
  // A bot filled in the hidden field: pretend it worked, save nothing.
  if (parsed.data.website) return Response.json({ ok: true });

  try {
    // Apps Script runs the script first, then answers with a redirect to a second
    // address that holds the reply. Follow that hop ourselves, with time limits,
    // so a slow second hop can never leave the visitor waiting forever.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, row: toRow(parsed.data, new Date()) }),
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    let reply: { ok?: boolean; error?: string } | null;
    const next = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (next) {
      try {
        reply = await (await fetch(new URL(next, url), { signal: AbortSignal.timeout(10_000) })).json();
      } catch (hop) {
        // The script has already run; only its confirmation is missing.
        console.warn("Feedback sent, confirmation didn't arrive:", hop);
        return Response.json({ ok: true });
      }
    } else {
      reply = await res.json().catch(() => null);
    }
    if (!reply?.ok) throw new Error(`Sheet replied ${res.status}: ${JSON.stringify(reply)}`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Feedback not saved:", err); // the real reason, in the server log
    return Response.json({ ok: false, error: "That didn't save. Please try again in a minute." }, { status: 502 });
  }
}
