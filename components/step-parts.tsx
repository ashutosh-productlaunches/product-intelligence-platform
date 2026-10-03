// Pieces of a step page that aren't layout: code, figures, the architecture bar,
// the look swatch and the review questions. Server components; no JavaScript.
import type { ReactNode } from "react";
import type { Layer } from "@/content/journey-01";
import type { Question } from "@/content/checks-01";
import type { Look } from "@/content/looks";
import { bench, benchLabel } from "@/components/style";

// Code the learner types or runs: dark, like the terminal or editor they'll paste it into.
export function Code({ children }: { children: string }) {
  return <pre className="mt-3 overflow-x-auto rounded-[3px] bg-ink px-4 py-3 font-mono text-[13px] leading-relaxed text-paper">{children}</pre>;
}

// A plain-text diagram, set as a numbered figure.
export function Figure({ children, n, caption }: { children: string; n: number; caption: string }) {
  return (
    <figure className="mt-6">
      <pre className="overflow-x-auto rounded-[3px] border border-rule bg-paper-2 px-4 py-4 font-mono text-[13px] leading-relaxed">{children}</pre>
      <figcaption className="mt-2 text-[15px] text-graphite">
        <span className="font-label text-[13px]">Fig. {n}</span> — {caption}
      </figcaption>
    </figure>
  );
}

// A callout: a light-blue box with a bold label.
export function Note({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[3px] bg-signal-soft px-4 py-3 text-[16px] leading-relaxed">
      <p className="font-label text-[13px] font-bold">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// The PM lens: the line a PM should take away, set large.
export function PmLens({ label = "PM lens · why you should care", children }: { label?: string; children: ReactNode }) {
  return (
    <div className="border-l-4 border-signal pl-5">
      <p className="font-label text-[13px] font-bold text-signal">{label}</p>
      <p className="mt-2 text-[22px] leading-snug font-medium sm:text-[24px]">{children}</p>
    </div>
  );
}

// A small picture of a look, drawn from its own tokens: background, text, surface and accent.
export function LookSwatch({ look }: { look: Look }) {
  const t = look.tokens;
  return (
    <span
      aria-hidden
      className="grid h-14 w-24 shrink-0 content-center gap-1.5 overflow-hidden border px-2.5"
      style={{ background: t.bg, borderColor: t.border, borderRadius: t.radius }}
    >
      <span className="block h-1.5 w-12 rounded-full" style={{ background: t.text }} />
      <span className="block h-3 w-full border" style={{ background: t.surface, borderColor: t.border, borderRadius: t.radius }} />
      <span className="block h-2 w-8 rounded-full" style={{ background: t.accent }} />
    </span>
  );
}

// Five questions after each step. Each answer opens to say why it's right or why it's wrong.
// Plain <details>, so no JavaScript and no score: a self-check, not an exam.
// Put the correct answer in a varied position (A, B or C) so it can't be guessed by position.
// Deterministic: the same question always shows the same order.
function placed<T extends { correct?: true }>(answers: T[], step: number, qi: number): T[] {
  const right = answers.find((a) => a.correct)!;
  const wrong = answers.filter((a) => !a.correct);
  const at = (qi * 2 + step) % answers.length;
  return [...wrong.slice(0, at), right, ...wrong.slice(at)];
}

export function CheckUnderstanding({ questions, step }: { questions: Question[]; step: number }) {
  const letters = ["A", "B", "C", "D"];
  return (
    <ol className="grid gap-9">
      {questions.map((qn, qi) => (
        <li key={qn.q}>
          <p className="text-[18px] leading-snug font-semibold">
            <span className="mr-2 font-label text-[13px] font-normal text-graphite">
              {step}.{qi + 1}
            </span>
            {qn.q}
          </p>
          <div className="mt-3 border-t border-rule">
            {placed(qn.answers, step, qi).map((a, ai) => (
              <details key={a.text} className="border-b border-rule">
                <summary className="flex cursor-pointer list-none gap-3 py-2.5 text-[16px] leading-snug hover:text-signal">
                  <span className="font-label text-[13px] leading-6 text-graphite">{letters[ai]}</span>
                  <span>{a.text}</span>
                </summary>
                <p className={`mb-3 ml-6 border-l-2 pl-3 text-[16px] leading-relaxed ${a.correct ? "border-pass" : "border-fail"}`}>
                  <span className={`font-label text-[13px] font-bold ${a.correct ? "text-pass" : "text-fail"}`}>{a.correct ? "Correct. " : "Not quite. "}</span>
                  {a.why}
                </p>
              </details>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

// The app's architecture as a small schematic at the top of every step.
// Blue: what this step builds. Outline: what earlier steps built. Dashed: still to come.
const ARCH: { id: Layer; label: string; short: string; note: string }[] = [
  { id: "computer", label: "Your computer", short: "Laptop", note: "VS Code · Node" },
  { id: "page", label: "Page", short: "Page", note: "what people see" },
  { id: "server", label: "Server", short: "Server", note: "holds the key" },
  { id: "model", label: "Model", short: "Model", note: "Gemini" },
  { id: "internet", label: "GitHub + Vercel", short: "Online", note: "live URL" },
];

export function ArchitectureBar({ current, built }: { current: Layer[]; built: Layer[] }) {
  const box = (id: Layer) =>
    current.includes(id)
      ? "border-signal bg-signal text-white"
      : built.includes(id)
        ? "border-graphite/60 bg-paper text-ink"
        : "border-dashed border-graphite/60 text-graphite";
  const cell = (l: (typeof ARCH)[number]) => (
    <div className={`min-w-0 flex-1 rounded-[3px] border px-1.5 py-2 sm:px-2.5 ${box(l.id)}`}>
      <p className="truncate font-label text-[11px] leading-tight font-semibold sm:text-[12px]">
        <span className="sm:hidden">{l.short}</span>
        <span className="hidden sm:inline">{l.label}</span>
      </p>
      <p className="mt-0.5 hidden truncate text-[13px] leading-tight opacity-80 sm:block">{l.note}</p>
    </div>
  );
  const wire = <span aria-hidden className="self-center font-label text-[13px] text-graphite">→</span>;
  const gap = <span aria-hidden className="w-px self-stretch bg-rule" />;
  const [computer, page, server, model, internet] = ARCH;
  return (
    <figure className={`${bench} px-3 py-3 sm:px-4`} aria-label={`This step works on: ${current.join(", ")}`}>
      <figcaption className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className={benchLabel}>Where this step works</span>
        <span className="flex gap-4 font-label text-[11px] text-graphite">
          <span><span className="mr-1.5 inline-block h-2 w-2 rounded-[2px] bg-signal align-middle" />this step</span>
          <span><span className="mr-1.5 inline-block h-2 w-2 rounded-[2px] border border-graphite align-middle" />built</span>
          <span className="hidden sm:inline"><span className="mr-1.5 inline-block h-2 w-2 rounded-[2px] border border-dashed border-graphite align-middle" />to come</span>
        </span>
      </figcaption>
      <div className="flex items-stretch gap-1 sm:gap-2">
        {cell(computer)}
        {gap}
        {cell(page)}
        {wire}
        {cell(server)}
        {wire}
        {cell(model)}
        {gap}
        {cell(internet)}
      </div>
    </figure>
  );
}
