# AI Tool Lab — handover

Last updated: 26 September 2026 (night). Written so a new session (claude.ai project chat or Claude Code) can pick up without re-deriving anything. A copy lives in the repo at `docs/handover.md`.

## What the project is

A hands-on learning environment for **product managers who want to understand how AI applications are actually built**. The learner builds a real AI app from an empty folder with the real stack (VS Code, Node, npm, Next.js, an AI API, Git, GitHub, Vercel); the app is the vehicle, technical understanding is the value. Central line: **"AI can write the code. You should still understand it."** Not an AI app builder (Lovable, Replit, Bolt, v0, Cursor solve a different goal), not no-code, not a prompt course, no gamification. Learners don't write code from scratch: each step explains, then gives the code to paste and run.

It began as "Product Intelligence Agent", a ten-node research pipeline, abandoned 22 Sep. Do not rebuild it.

## Where everything lives

| | |
|---|---|
| Local repo | `C:\Personal Projects\product-intelligence-platform` (Windows, PowerShell) |
| GitHub | `github.com/ashutosh-productlaunches/product-intelligence-platform` (public) |
| **Live site** | **`https://buildailab.vercel.app/`** (free Vercel name, added 26 Sep; checked publicly reachable). Also still works: `product-intelligence-platform-ashutosh.vercel.app`. `buildai.lab` is attached to the project but can never work: `.lab` isn't a real top-level domain. He wants no paid domain. |
| Pages | `/` overview + journey · `/demo` live tool · `/architecture` system map |
| Vercel | project `product-intelligence-platform` (id `prj_7UD6Yrtv91WyCw6JWjrdintYvrnc`, team `pro-launch`). Every push to `main` deploys to production. |
| Rubric | `docs/ai-suitability-rubric.md` — source of truth for Journey 2 |

## Stack

Next.js 16 (App Router), TypeScript, Tailwind 4, Zod 4, `@google/genai`, Vitest, Vercel. Gemini `gemini-3.6-flash` free tier (daily quota per Google project, resets midnight Pacific). No database; state in the URL.

## Home page structure (as of 26 Sep night)

- **Side rail** (`components/section-nav.tsx`): desktop table of contents fixed on the left — Overview, Your app, Journey (12 steps grouped by 5 stages, ✓ done, current highlighted), Live demo →, System map →. Phones: one bottom button "Step N of 12 · Contents". No top tab bar (he rejected two bars and a "Finish" tab).
- **Overview**: eyebrow, headline "Learn how AI applications are actually built.", rolling word "Understand every layer: LLM / API / server / …" (CSS only), one-sentence promise, principle quote, comparison matrix (AI app builders vs this lab), 8 "What you'll actually understand" items. Copy in `content/site.ts`. Scroll-reveal animations via CSS `animation-timeline: view()` (Maven-inspired).
- **Your app**: pick the pattern first, then "What you see / What's actually happening" picture below it; picking scrolls to `#underneath`.
- **Journey player** (`components/journey-player.tsx`): one step on screen at a time, stepper with 12 segments by stage, Back/Next; the step in the address (`#step-6`, `#done`). Each step: architecture bar (this step filled, earlier built outlined; building counts from step 3) + one-line problem + tabs **Why · Do it · See it work · Break it (steps 5–10) · Understand · Quiz** (`components/panes.tsx`, experiments in `components/lab.tsx` + `content/experiments-01.ts`). Last step remembered in localStorage (`buildailab:step`) with a Welcome back banner. Finish is the last card with tabs: What you built · The anatomy · Reuse the pattern · Questions · What's next.
- **Quiz**: 60 questions in `content/checks-01.ts` (5 per step, 3 answers, each with its own explanation; correct position balanced 20/20/20).
- **"Didn't work?"**: known causes + most likely fix, then **Copy context for your AI** (`lib/tutor-context.ts`), which replaced the old "Coming soon" tutor placeholder. A built-in contextual tutor is a hypothesis to validate, not a decision.
- **Before you start / Time** box above the journey (`site.before` in `content/site.ts`).

## Decisions — do not reopen without reason

- Keep the real technical stack; explain complexity rather than hide it. Step order stays.
- He wants the site short and visual, not text-heavy. Prefer interaction and pictures over paragraphs.
- Design direction Transmutation for `/demo`; journey page light.
- Never fake model output. No gamification.

## How to work with him

- **He types:** schemas, classifier, fixtures, tests, rubric. **Assistant writes:** UI, plumbing, content drafts.
- Explain the approach before writing code; minimal, focused changes. Don't make the site bigger: he wants it short, visual, not text-heavy.
- **Git:** he commits and pushes himself unless he says otherwise. Every push to `main` deploys to production, so never push without asking.
- In Claude Code: read `AGENTS.md` first (Next.js 16 has breaking changes; check `node_modules/next/dist/docs/`). Verify with `npx tsc --noEmit`, `npm run lint` (only the deliberate `<a href="/">` errors are expected), `npm test`, `npm run build`. Check the UI at 1440 and 390 widths.
- In a claude.ai/Cowork session: that cloud can't push or reach vercel.app/Google. Write files to his repo through the device bridge (new components first, `page.tsx` last) and confirm with md5.

## Lab changes (26 Sep night)

Strategy agreed: the 12 lessons aren't a moat; make the core loop a lab (predict → break → compare), test tutor demand cheaply before building a tutor. Quiz kept as is (predictions added inside experiments, not moved out of the quiz).

- **Break it tab** (steps 5–10): `content/experiments-01.ts` + `components/lab.tsx`. Guess locks, answer shown only after "I ran it". Experiments: wrong key (5), leak a pretend secret via route reply (6), temperature 0 vs 2 (7), schema expects 5 / prompt asks 3, watch the retry (8), delete lib/ask.ts and `git restore` (9), push a TypeScript error and see the live site survive (10).
- **Step 5 quick win**: `try-key.mjs` + `node --env-file=.env.local try-key.mjs` = first model call; step 7 now refers back to the prose reply.
- **Copy context for your AI** replaces the "Coming soon" tutor placeholder (`lib/tutor-context.ts`): step, steps done, files expected, code given, expected result, known causes, teach-don't-just-fix rules. This is the tutor demand test.
- **Resume**: last step saved in localStorage (`buildailab:step`); "Welcome back" banner when no step in the address.
- **Before you start / Time** box above the journey (`site.before`). No time number on purpose: replace with a measured time after testers.
- Verified in cloud: tsc, lint (only the deliberate `<a href="/">` errors), vitest, `next build`, Playwright at 1440 and 390, clipboard copy. md5 of all 7 device files matches.
- **Not verified**: experiments against a real Gemini key (cloud can't reach Google). He should run steps 5–10 experiments once himself; the exact wording of Google's invalid-key error and how often step 8's retry succeeds are unconfirmed.
- Commit status: written to his laptop 26 Sep night. If `git status` shows them uncommitted, he runs `git add app components content lib docs`, `git commit -m "Lab: Break it experiments, step 5 first call, copy context for your AI, resume"`, `git push`.
- He writes a test for `lib/tutor-context.ts` (`filesIn`, `helpPrompt`) — tests are his.

## Open items

- Optional: remove `buildai.lab` in Vercel → Settings → Domains.
- Validate first: real completion time (3 testers), whether testers use Copy context, which PM segment (interview prep vs team shipping AI).
- Not built on purpose: checkpoint verifier for deployed URL (optional sixth), "stuck here" feedback (needs a destination he chooses), AI tutor, accounts, payments.

## Next

- First: run the steps 5–10 experiments once with a real key and fix any wording that doesn't match what actually happens. Then run 3–5 PMs through it one by one on a call, with him as the tutor; record errors, questions and completion time.
- He may still want to do the learning review (Round 1 questions on stage 1 were sent, unanswered).
- P1 ideas not built: "Should this use AI?" framework. Then Journey 2 step 1.3 (schemas, he writes).
- Loose ends: `tsconfig.check.json` and `Claude outputs/` stay untracked; plain `<a href="/">` lint errors are deliberate.

## Resume prompt

> Resume the BuildAI Lab work. Read `docs/handover.md` and `AGENTS.md` first. Live site: https://buildailab.vercel.app/. Start by checking `git status` and whether the Break it / Copy context changes are live, then ask me what I want next. Don't push without asking.
