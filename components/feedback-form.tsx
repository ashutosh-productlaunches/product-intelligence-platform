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
      <p className="rounded-lg border border-emerald-600/40 bg-emerald-50/60 p-4 text-[15px] font-medium dark:border-emerald-500/30 dark:bg-emerald-950/20">
        ✓ {f.thanks}
      </p>
    );
  }

  const label = "text-sm font-semibold";
  const field =
    "mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-[15px] focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-200";

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <fieldset>
        <legend className={label}>Which describes you best?</legend>
        <div className="mt-2 grid gap-1.5">
          {f.roles.map((r, i) => (
            <label key={r.value} className="flex items-center gap-2.5 text-[15px]">
              <input type="radio" name="role" value={r.value} required={i === 0} className="accent-zinc-900 dark:accent-zinc-100" />
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
        <span className="block text-sm text-zinc-500">{f.messageHint}</span>
        <textarea name="message" required minLength={3} maxLength={1500} rows={4} className={field} />
      </label>

      <label className="block">
        <span className={label}>
          Email <span className="font-normal text-zinc-500">(optional, if you&apos;d like a reply)</span>
        </span>
        <input type="email" name="email" maxLength={200} autoComplete="email" className={field} />
      </label>

      {/* Hidden from people; bots that fill every field reveal themselves here. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={state.kind === "sending"}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {state.kind === "sending" ? "Sending…" : "Send"}
        </button>
        <span className="text-sm text-zinc-500">{f.privacy}</span>
      </div>
      {state.kind === "error" && <p className="text-sm font-medium text-red-700 dark:text-red-400">{state.message}</p>}
    </form>
  );
}
