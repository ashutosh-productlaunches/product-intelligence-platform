// Builds the "Copy context for your AI" prompt for one step.
//
// Why this exists: a generic chatbot doesn't know where the learner is.
// This prompt tells it — the step, what's already built, the files that should
// exist, the code they were given, what success looks like, the known failures —
// and asks it to teach rather than just fix. It is also a cheap test of whether
// a built-in contextual tutor is worth building: if learners use this a lot,
// that's evidence.
//
// Pure function: text in, text out. No model call, no storage.
import type { Step } from "@/content/journey-01";

// Files a step asks the learner to create, read from the first line of each code block
// section, e.g. "// lib/ask.ts" or "# .env.local".
export function filesIn(code: string | undefined): string[] {
  if (!code) return [];
  const found = code.matchAll(/^(?:\/\/|#) ([\w./-]+\.\w+)\b/gm);
  return [...new Set([...found].map((m) => m[1]))];
}

export function helpPrompt({
  steps,
  index,
  appName,
}: {
  steps: Step[];
  index: number; // 0-based
  appName: string;
}): string {
  const step = steps[index];
  const n = index + 1;
  const earlier = steps.slice(0, index);
  const files = [...new Set(steps.slice(0, n).flatMap((s) => filesIn(s.code)))];

  const lines: string[] = [
    `I'm a product manager learning how AI apps are built, following "Build your first AI application" at buildailab.vercel.app. I'm not a software engineer. Please help me like a good tutor, not just a fixer.`,
    "",
    `WHERE I AM: step ${n} of ${steps.length}, "${step.title}" (${step.concept}). The app I'm building: ${appName}.`,
    earlier.length
      ? `DONE SO FAR: ${earlier.map((s, i) => `${i + 1}. ${s.title}`).join("; ")}.`
      : "DONE SO FAR: nothing yet, this is the first step.",
    "MY STACK: Next.js (App Router, TypeScript) in VS Code, Node.js, the @google/genai library with Gemini (gemini-3.6-flash, free tier), Zod, Git, GitHub, Vercel.",
    files.length ? `FILES I SHOULD HAVE BY NOW: ${files.join(", ")}.` : "",
    "",
    `WHAT THIS STEP ASKED ME TO DO: ${step.action}`,
    step.install
      ? `\nTOOLS I WAS ASKED TO INSTALL: ${step.install.map((t) => `${t.name} from ${t.from} (or: ${t.cli.windows} on Windows, ${t.cli.mac} on a Mac)`).join("; ")}.`
      : "",
    step.thenCheck ? step.thenCheck : "",
    step.code ? `\nTHE CODE I WAS GIVEN:\n\`\`\`\n${step.code}\n\`\`\`` : "",
    `\nWHAT I SHOULD SEE IF IT WORKED: ${step.result}`,
    step.fails
      ? `\nKNOWN CAUSES FOR THIS STEP: ${step.fails.causes.join(" | ")}\nMOST LIKELY FIX: ${step.fails.fix}`
      : "",
    "",
    "WHAT WENT WRONG (my error message, a screenshot, or what I see instead):",
    "[paste here]",
    "",
    "HOW TO HELP ME:",
    "1. Say which layer the problem is in: my computer, the page, the server, the model, or GitHub/Vercel.",
    "2. Explain what happened and why, in plain words, before giving any fix.",
    "3. Give the smallest fix, one change at a time. Don't rewrite my project or add new libraries.",
    "4. Name the concept behind the problem in one or two sentences.",
    "5. Tell me exactly how to check that it worked.",
    "If you need more information, ask me one question at a time.",
  ];
  return lines.filter((l, i, all) => !(l === "" && all[i - 1] === "")).join("\n").trim();
}
