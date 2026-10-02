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
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, row: toRow(parsed.data, new Date()) }),
    });
    const reply = await res.json().catch(() => null);
    if (!res.ok || !reply?.ok) throw new Error(`Sheet replied ${res.status}: ${JSON.stringify(reply)}`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Feedback not saved:", err); // the real reason, in the server log
    return Response.json({ ok: false, error: "That didn't save. Please try again in a minute." }, { status: 502 });
  }
}
