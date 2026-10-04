# BuildAI Lab — design direction

Status: agreed direction, P0 spec. Build steps 1–2 done (foundation; journey step and navigation).
Chosen 3 Oct 2026: **A "The Annotated Manual" + B "The Bench" are P0. C "Descent" comes later.**

**Visual style changed 3 Oct 2026: in the style of the Atlassian website.** The cream paper, serif and
orange-red accent were rejected ("typical Claude colour"). The *structure* of A + B stays (reading column
and margin notes, panels for anything that runs, one navigation, one advance control). The *look* is now:
white canvas, navy text, one cobalt blue, a single friendly sans, 3px corners, a pill only for the primary
action. Where this file still says serif, paper, ink, mono labels or "corners 0", the Tokens and Type
sections below win.

Not Atlassian: no Atlassian name, logo or Charlie typeface (it's proprietary). Figtree stands in for it.
Reference values come from third-party breakdowns of atlassian.com (the site itself couldn't be reached
from the build environment): cobalt `#1868DB`, navy `#172B4D`, subtle text `#44546F`, grey surface `#F7F8F9`,
pill primary button, 3px elsewhere.

## The one rule

**Read like a manual. Test like a bench.**

- **A owns the words.** Anything you *read* (explanations, the PM lens, procedures, review questions, the story on /why) gets the manual treatment: serif, reading column, margin notes, rules instead of boxes.
- **B owns the machine.** Anything that *runs, measures or shows how the system is wired* (the live tool, Break it, the architecture bar, the system map, diagrams) gets the bench treatment: mono labels, flat square panels, schematics, real readouts.
- No component is both. If you can't tell which side a component is on, it's on A's side.

They share one paper, one ink, one accent and one grid, so the site reads as one product.

## Why A + B, and why C waits

- A gives trust and readability, which is what a PM needs to finish twelve steps. B gives proof: the app is real, and it can be measured. Either one alone is weaker. A on its own reads like a blog, and B on its own reads like developer tooling.
- C (a scroll-driven cutaway) is the strongest idea for getting the site shared, and the costliest to build. It reuses B's request schematic and A+B's tokens, so P0 lays its foundation without paying its risk.

## Name

**BuildAI Lab** everywhere: nav, metadata, /demo, docs. Retire "AI Tool Lab for PMs" and "TOOL LAB".

## Tokens

| Token | Light | Use |
|---|---|---|
| `paper` | `#FFFFFF` | page background |
| `paper-2` | `#F7F8F9` | panels (B) |
| `ink` | `#172B4D` | text (navy) |
| `graphite` | `#44546F` | secondary text |
| `rule` | `#DCDFE4` | hairlines, borders |
| `signal` | `#1868DB` | **one meaning: the action, or "this step / this is live"** |
| `signal-hover` | `#1558BC` | hover on blue |
| `signal-soft` | `#E9F2FE` | margin notes, "your app" callouts, lozenges |
| `pass` | `#216E4E` | only a check that passed |
| `fail` | `#C9372C` | only a check that failed |

- Retire emerald, sky, amber, rose and zinc as semantic colours.
- Corners: 3px on panels, boxes, inputs and code. The primary button is a pill; secondary buttons are pill outlines. Shadows only on overlays (the Contents sheet). No gradients. No backdrop blur.
- Contrast checked for small text (WCAG AA): on white, ink 14.1:1, graphite 7.7:1, signal 5.2:1, pass 6.2:1, fail 5.2:1; on paper-2 all ≥ 4.8:1. White on signal 5.2:1. Pass started at `#1F845A` and failed on paper-2 (4.4:1), so it was darkened. `rule` is for lines only.
- **Light only for P0.** Dark mode is P1. Existing `dark:` classes are inert until then (`@custom-variant dark` in `app/globals.css`).

## Type

| Role | Face | Notes |
|---|---|---|
| Everything you read: headings, body, labels, nav, buttons | **Figtree** | headings semibold, tracking −0.02em; body 18px / 1.6; labels 13px (`font-label` token) |
| Code and readouts only | **IBM Plex Mono** | 13px |

- Two families only. No Geist, Inter or system sans.
- Uppercase letter-spaced labels are allowed **only on panel headers**, e.g. `WHERE THIS STEP WORKS`. Everywhere else, labels are sentence case.
- No decorative ✓ / → / ›. Arrows only where something actually flows (diagrams, the request path).

## Layout

- 12-column grid. Reading pages: 7-column text plus a 4-column margin from about 1100px. Below that, margin notes drop inline after their paragraph.
- Bench panels may break out to the full 12 columns.
- Sections are separated by space and 1px rules, not cards. No box inside a box.
- Left-aligned. Nothing centred except figures.

## Navigation

- **Replaces the left rail.** One thin status bar fixed at the top (B):
  `BuildAI Lab │ Journey 1 · §06/12 · Keep the key off the browser │ Contents`
- **Contents** opens the table of contents (A): five parts, § numbers, dot leaders, done/current marks. On phones it's a full-screen sheet; the floating pill goes away.
- Inside a step: a 12-cell channel strip (`01`–`12`, grouped by part) that only shows position and lets you jump. It is **not** a second "Next" button.
- **One advance control per step.** Panes advance with Continue; the last pane's button goes to the next step. The stepper's Back/Next is removed. (This fixes the three competing "next" controls.)

## Page by page

**Home `/`**
1. Hero (A): left-aligned headline "Understand how AI applications actually work by building one." plus one sentence for PMs. No ticker, no pull quote, no comparison table.
2. The instrument (B), straight after the hero: the request schematic `INPUT → PAGE → SERVER → MODEL → CHECK → SCREEN`, a mode selector (the app picker), sample text and **Run**. A real call, with readouts on the wires.
3. "What you'll understand" (A): the 9 terms set as a short glossary, not a 3-column checklist.
4. The journey (A): a table of contents for Journey 1 with a "Begin at §1" link.
- The six ticker questions become a margin list, "Questions this answers". The builders comparison becomes one paragraph or goes to /why.

**Journey step**
- Chapter opening (A): `§06`, title, the problem as the opening paragraph.
- Architecture bar (B): a small schematic. Built layers are drawn in ink, this step's layers in signal, future layers dashed.
- Panes keep their order: Why · Do it · See it work · Break it · Understand · Quiz. They're styled as `§6.1 Why`, `§6.2 Do it` …, in mono, not a grey tab pill.
  - Why, Do it, Understand, Quiz → A. Do it is a numbered procedure with hanging indents, and Quiz becomes "Questions for review".
  - See it work, Break it → B. Break it is a bench panel: *predict → break → observed*.
  - **PM lens** is the most important line in a step, so it's set large in serif with a signal rule, not a small dark box.
  - "Where people get stuck" → a margin note.
- Code: ink on `paper-2`, square, mono. Code you paste into a terminal may stay dark.

**App picker**
- Mode selector on the instrument: `MODE ◉ Summarise ○ Classify ○ Extract ○ Rewrite ○ Answer`. Changing it rewires the schematic and the sample. "Make it yours" (the three questions) opens below as a short form. URL state stays as it is.

**/demo**
- Merges into the instrument. It drops the Transmutation look (dark neon, gradient pill buttons, orb, glass panels). The `transmutation` look stays in `content/looks.ts` as one of the options learners can pick in step 12; it's no longer the site's own skin.

**/architecture**
- Bench schematic: orthogonal 1px ink wiring, mono labels, signal for the chosen flow, square nodes, and hover cards with no shadow.

**/roadmap, /why** → A.

## Diagrams

- One diagram language for both sides: 1px ink lines, right angles, mono labels, and a serif italic caption `Fig. 6.1 — …`.
- The plain-text diagrams stay, set inside a ruled figure box with a caption.

## Readouts: honest numbers only

- `lib/run-demo.ts` already measures `ms`, `inputTokens` and `outputTokens`, and whether the reply was repaired. Show those.
- Don't show cost unless it's computed from a cited, dated price and labelled as an estimate.
- Never show placeholder or made-up numbers, not even in empty states. An empty state shows `—`.

## Motion

- A: figures draw their lines once on first view. Nothing else.
- B: a signal pulse travels the schematic during a real run, tied to real phases (sent → model → check → shown). Mechanical, with no bounce.
- Remove the scroll-reveal (`.reveal`): it hides content until you scroll to it.
- `prefers-reduced-motion`: no motion at all.

## Keep (from the audit)

All wording in `content/`, the 5 parts and 12 steps, the pane order, Break it, the PM lens, the architecture bar concept, the system map content, URL state, server rendering, working without JavaScript, the resume prompt, and the honest status labels.

## Build order (P0)

1. Foundation: name, fonts, tokens, base styles. Remove Geist and the zinc/emerald palette.
2. Journey step and navigation (the screen learners spend most time on). Screenshot review.
3. Home: hero and the instrument (absorbs /demo).
4. /demo redirect or slim version, /architecture.
5. /roadmap, /why.

Each is its own commit, with desktop and phone screenshots before moving on.

## Structure: journeys as pages, steps as scrolling pages (3 Oct, supersedes "tabs stay")

Room for more journeys, and a layout that scales past six panes. Pattern taken from
meet-polar-bear.com/skills (structure only, not its look): one long page, numbered sections
whose number stays in the margin while you read, a side panel that stays on screen, and items
as numbered rows with labelled pairs.

- **Addresses:** `/` home (what the lab is, pick your app, every journey) · `/journeys/1`
  overview (outcome, the route grouped by part, what's after) · `/journeys/1/6` one step ·
  `/journeys/1/done` the finish. The learner's app travels in the query string on every link.
  Old `/#step-6` links redirect.
- **Adding a journey:** write its content like `content/journey-01.ts` (+ checks, experiments)
  and add one entry to `content/journeys.ts`. Navigation, pages and saved progress read from it.
  Unbuilt journeys come from `content/roadmap.ts`.
- **Saved progress:** per journey (`buildailab:j1`); Journey 1 still reads the old key.
- **Step page:** navy hero (breadcrumb, "Step 6 of 12 · concept", title, the problem), the
  architecture bar, then numbered sections: Why · Do it · See it work · Break it · Understand ·
  Check yourself. Install parts (3.1, 3.2 …) are stacked, not paged. Nothing is collapsed
  except where hiding is the lesson: Break it's answer (until you predict) and quiz explanations
  (until you pick). "Didn't work?", "In depth" and the look options are always open.
- **Navigation is always visible (4 Oct, after "there is no menu"):** the top bar shows
  Journeys · Live demo · System map · What you'll learn · Why I built this on wide screens; on
  phones a **Menu** button opens them first, then every step. Step and finish pages have a
  left sidebar (Confluence/docs style): the journey's parts and steps, the current step opened
  to its sections (the one you're reading highlighted), a progress bar, and **Next** pinned at
  the bottom. Every step page also ends with "Up next". The right-hand side panel is gone.
- Tabs (`Panes`), the paged install parts (`Parts`), the single-page player and the left-rail
  nav are removed.

## Decided 3 Oct

- ~~Tabs stay.~~ Replaced by scrolling step pages (see Structure, above).
- **No dark mode in P0.**
- **Real readouts on the live tool: yes.** Response time and token counts from `lib/run-demo.ts` may be passed to the page.

## Reopens earlier decisions

From `docs/handover.md`:
- "Design direction Transmutation for /demo; journey page light": replaced by this document.
- "Short and visual, not text-heavy": A is a reading direction. To stay true to that, A changes how prose is *set*, not how much there is; panes still split it up, and B carries the visual load.
- "No top tab bar (rejected two bars)": the new top bar *replaces* the rail. It's still one navigation, and the channel strip only shows position.

## Later: C "Descent"

The home page as a vertical cutaway of one request. It reuses the request schematic, the tokens and the readouts. Start it only after P0 has had real users.
