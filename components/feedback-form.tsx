"use client";
// The feedback form on /why. It posts to /api/feedback, which checks it and
// writes one row to the sheet. It adds how far the visitor got in the journey
// (saved in this browser by the journey pages), so answers can be read in context.
import { useState } from "react";
import { why } from "@/content/why";
import { savedStep } from "@/components/progress";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

function stepReached(): string {
  const n = savedStep(1);
  return n ? String(n) : "";
}

export function FeedbackForm() {
  const f = why.form;
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, step: stepReached(), page: "/why" }),
        signal: AbortSignal.timeout(25_000), // never sit on "Sending…" forever
      });
      const reply = await res.json().catch(() => null);
      if (reply?.ok) setState({ kind: "sent" });
      else setState({ kind: "error", message: reply?.error ?? "That didn't save. Please try again." });
    } catch (err) {
      const slow = err instanceof DOMException && err.name === "TimeoutError";
      setState({
        kind: "error",
        message: slow ? "This is taking too long. It may still have saved, so please wait a minute before sending again." : "No connection. Please try again.",
      });
    }
  }

  if (state.kind === "sent") {
    return (
      <p className="rounded-[3px] border border-pass/40 bg-[#dcfff1] p-4 text-[16px] font-medium">
        {f.thanks}
      </p>
    );
  }

  const label = "text-[15px] font-semibold";
  const field =
    "mt-1.5 w-full rounded-[3px] border-2 border-rule bg-paper px-3 py-2 text-[16px] focus:border-signal focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <fieldset>
        <legend className={label}>Which describes you best?</legend>
        <div className="mt-2 grid gap-1.5">
          {f.roles.map((r, i) => (
            <label key={r.value} className="flex items-center gap-2.5 text-[15px]">
              <input type="radio" name="role" value={r.value} required={i === 0} className="accent-signal" />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className={label}>What should the lab teach next?</span>
        {/* No answer picked in advance, so nobody is counted for an option they didn't choose. */}
        <select name="next" required defaultValue="" className={field}>
          <option value="" disabled>
            Choose one
          </option>
          {f.next.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={label}>{f.messageLabel}</span>
        <span className="block text-[14px] text-graphite">{f.messageHint}</span>
        <textarea name="message" required minLength={3} maxLength={1500} rows={4} className={field} />
      </label>

      <label className="block">
        <span className={label}>
          Email <span className="font-normal text-graphite">(optional, if you&apos;d like a reply)</span>
        </span>
        <input type="email" name="email" maxLength={200} autoComplete="email" className={field} />
      </label>

      {/* Hidden from people; bots that fill every field reveal themselves here. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={state.kind === "sending"}
          className="rounded-full bg-signal px-6 py-2.5 text-[15px] font-semibold text-white hover:bg-signal-hover disabled:opacity-60"
        >
          {state.kind === "sending" ? "Sending…" : "Send"}
        </button>
        <span className="text-[14px] text-graphite">{f.privacy}</span>
      </div>
      {state.kind === "error" && <p className="text-[14px] font-medium text-fail">{state.message}</p>}
    </form>
  );
}
