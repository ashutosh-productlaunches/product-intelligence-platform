# AI Suitability Rubric

Version 1.0 · Slice 1

This rubric decides whether a single product capability should be built as deterministic software, a rules engine, traditional machine learning, an LLM-assisted step or an agentic workflow — and whether a human must stay in the loop.

It rests on two principles carried over from the original draft:

- **AI Necessity.** If deterministic software, rules or conventional automation can solve the problem adequately, an LLM should not be introduced just because it is available.
- **AI Appropriateness.** If AI is useful, the level of autonomy must match the risk. Higher-risk decisions need human review, approval or stronger guardrails.

The classifier implements both. It checks non-AI options first (Necessity), and it applies a human-in-the-loop overlay based on risk (Appropriateness).

## How the rubric is used

| Step | Who | What |
|---|---|---|
| 1 | User | Describes one capability in a sentence or two |
| 2 | User | Answers three yes/no gate questions |
| 3 | LLM | Scores six dimensions from 1 to 5, each with a justification and a basis |
| 4 | Code | Applies the mapping rules and returns a class, the overlay and any warnings |

**The model sees sections 1 and 2 only.** It never sees the gates or the mapping rules. If it knew which scores lead to which class, it could score backwards from a conclusion.

**Direction convention.** Every dimension points the same way: low scores push toward deterministic software, high scores push toward AI. This keeps the mapping rules readable.

**One capability per assessment.** "Extract line items from supplier invoice PDFs and match them to the purchase order" is two capabilities: extraction (likely LLM-assisted) and matching (deterministic). Split bundled descriptions before scoring, or the scores average two different answers into one wrong one.

## 1. Scored dimensions

### 1.1 Input structure

What form does the input arrive in?

| Score | Anchor | Example |
|---|---|---|
| 1 | Structured fields from a system of record | SKU, quantity, lead time, dates |
| 3 | Structured records plus some free text | Order records with a customer note field |
| 5 | Unstructured and heterogeneous | Emails, tickets, PDFs, call transcripts |

### 1.2 Output exactness

How strictly must the output be correct and repeatable? *(Original: Determinism)*

| Score | Anchor | Example |
|---|---|---|
| 1 | Exactly one correct answer; identical every time and auditable | A tax amount, a reorder quantity |
| 3 | A bounded answer; some variation is acceptable | A category from a fixed list, a ranked shortlist |
| 5 | Open judgement; many acceptable answers | A summary, a hypothesis, a recommendation |

### 1.3 Error tolerance

What does a wrong output cost, and how reversible is it? *(Original: Decision Risk)*

Score on the worse of severity and reversibility.

| Score | Anchor | Example |
|---|---|---|
| 1 | Severe financial, legal, safety or customer harm, and hard or impossible to reverse | Releasing a payment, shipping a hazardous item |
| 3 | Costly, but caught and reversed within normal operations | A wrong reorder quantity corrected on the next cycle |
| 5 | Cheap and easy to ignore or correct | A draft, an internal suggestion |

### 1.4 Reasoning type

What kind of thinking does the task need? *(Original: Reasoning Need)*

| Score | Anchor | Example |
|---|---|---|
| 1 | Lookup or closed-form calculation | Apply a formula, read a value |
| 3 | Pattern recognition, or classification into known categories | Flag unusual transactions, tag a ticket |
| 5 | Synthesis across several, possibly conflicting, sources; forming explanations | Explain why a SKU keeps stocking out |

### 1.5 Task variability

How predictable is the work? *(Original: Nature of Task)*

| Score | Anchor | Example |
|---|---|---|
| 1 | Stable SOP; every case can be listed in advance | Nightly replenishment run |
| 3 | Routine, with a known set of exceptions | Standard returns with defined exception codes |
| 5 | Open-ended; each case differs and the path is not known in advance | Root-cause investigation |

### 1.6 Volume and latency

How often does it run, and how fast must it respond? *(Added in v1.0)*

| Score | Anchor | Example |
|---|---|---|
| 1 | Very high volume or real time: thousands per hour, sub-second | Every scan event on a warehouse floor |
| 3 | Moderate: hundreds per day, seconds acceptable | Daily exception review |
| 5 | Low volume: a few per day, minutes acceptable | A weekly analysis |

At high volume, per-call cost and latency dominate, and even a 1% error rate becomes many errors a day. This is the strongest practical argument against LLMs in operational systems.

## 2. Scoring rules for the model

- Score only what the description supports.
- Give every score a one-sentence justification that refers to the description.
- Give every score a basis: `stated` if the description says it, `assumed` if you inferred it.
- Do not recommend an approach. Only score.

An `assumed` score is shown to the user as an assumption, not a fact.

## 3. Gates (answered by the user)

Gates capture facts the model cannot reliably infer from a one-sentence description. Asking the user is more honest than letting the model guess.

| Gate | Question | Used for |
|---|---|---|
| G1 `dataAvailable` | Is there enough relevant, trustworthy historical data with known outcomes for this task? | Required before traditional ML can be selected. A large amount of data is not enough on its own — it must be representative and labelled. |
| G2 `regulatedOrAudited` | Is this decision subject to regulation, audit or legal accountability? | Triggers the human-in-the-loop overlay for AI classes. |
| G3 `rulesChangeOften` | Do the business rules change often, and do business users rather than engineers need to change them? | Separates a rules engine from hard-coded software. |

Gates default to `no`. The interface shows them as explicit toggles so the default is always visible.

## 4. Classes

| Class | Meaning | Uses AI |
|---|---|---|
| `deterministic_software` | Hard-coded logic: formulas, queries, workflows | No |
| `rules_engine` | Configurable rules maintained by business users | No |
| `traditional_ml` | A model trained on labelled historical data: scoring, forecasting, classification | Predictive |
| `llm_assisted` | A single LLM step that reads, extracts, summarizes or drafts | Generative |
| `agentic_workflow` | An LLM that plans several steps and uses tools, on a path that varies by case | Autonomous |

Human-in-the-loop is not a class. It is an overlay that can apply to any class.

## 5. Mapping rules

S = input structure, E = output exactness, T = error tolerance, R = reasoning type, V = task variability, L = volume and latency.

Rules are checked in order and the first match wins. The order implements AI Necessity: non-AI options first, then the least autonomous AI option.

| # | Class | Condition |
|---|---|---|
| 1 | `rules_engine` | S ≤ 2, E ≤ 2, R ≤ 2, V ≤ 3, and G3 = yes |
| 2 | `deterministic_software` | S ≤ 2, E ≤ 2, R ≤ 2, V ≤ 3 |
| 3 | `traditional_ml` | S ≤ 3, R is 3 or 4, V ≤ 3, L ≤ 3, and G1 = yes |
| 4 | `agentic_workflow` | S ≥ 3, R ≥ 4, V ≥ 4 |
| 5 | `llm_assisted` | S ≥ 3 or R ≥ 3 |
| 6 | `deterministic_software` (fallback) | Nothing else matched. Prefer code and flag it. |

### Human-in-the-loop overlay

**The overlay compensates for unpredictability, not for importance.** Deterministic systems do not fail unpredictably: if the logic is right, it is right every time. They need upfront verification and an audit trail, not a person approving each output. AI systems can be wrong in ways nobody anticipated, so per-decision review is needed where the stakes are high.

| Class | Overlay applies when |
|---|---|
| `deterministic_software`, `rules_engine` | T = 1 — severe and irreversible. A human signs off even when the logic is right, because the inputs may not be. |
| `traditional_ml`, `llm_assisted` | T ≤ 2, or G2 = yes |
| `agentic_workflow` | T ≤ 3, or G2 = yes |

Agentic workflows get a lower bar because they act across several steps, and an early mistake compounds.

### Warnings

Warnings are reported alongside the verdict. They never change the class.

| Warning | When |
|---|---|
| `high_volume_ai` | L ≤ 2 and the class is `llm_assisted` or `agentic_workflow`. Check cost per call and latency before committing. |
| `assumed_scores` | Three or more dimensions have basis `assumed`. The description is too thin to classify confidently. |
| `fallback_rule` | Rule 6 matched. |

## 6. Worked examples

Only the two reference cases from the original project brief appear here. Every other expected classification belongs in the hand-scored test fixtures, which are written separately from this rubric so the tests check the rubric rather than restate it.

| Capability | S | E | T | R | V | L | Class | Overlay | Why |
|---|---|---|---|---|---|---|---|---|---|
| Calculate reorder quantity for a SKU | 1 | 1 | 3 | 1 | 2 | 2 | `deterministic_software` (rule 2) | No | A closed-form formula over structured data. A wrong quantity is corrected on the next cycle, so T = 3. |
| Investigate why a SKU repeatedly stocks out | 4 | 5 | 3 | 5 | 5 | 5 | `agentic_workflow` (rule 4) | Yes | Pulls evidence from inventory, vendor lead times, demand history and free-text notes, on a path that varies by case. Agentic with T ≤ 3. |

## 7. Known limitations

- A one-sentence description gives shallow scores. The basis field makes assumptions visible rather than hiding them.
- The thresholds are judgement calls, calibrated against fifteen hand-scored cases, not validated against real deployment outcomes.
- Real systems are often hybrids, such as an ML score with an LLM-written explanation. The rubric names the primary class only.
- LLM cost and latency keep falling, so the volume thresholds should be revisited.
- A perfect mapping still produces a wrong verdict if the model scores wrongly. Slice 3's evaluation measures scoring quality separately.

## 8. Changes from the original draft

| Original | v1.0 | Why |
|---|---|---|
| Nature of Task | Split into Input structure and Task variability | They vary independently: structured input can still be highly variable work |
| Determinism | Output exactness | Renamed so it is not confused with the class `deterministic_software` |
| Reasoning Need | Reasoning type | Anchored to three kinds of reasoning so scores are comparable |
| Data Availability | Gate G1, answered by the user | It cannot be inferred from a one-sentence description, so a model score would be a guess |
| Decision Risk | Error tolerance, scoring severity and reversibility | Reversibility kept from the original |
| Human Involvement | Removed as a dimension; now the overlay | It overlapped Decision Risk, and it is an output of the assessment rather than an input |
| — | Volume and latency | Missing; the main practical argument against LLMs in high-volume operations |
| — | Gates G2 and G3 | Regulation, and rules maintained by the business |
| Gate 1 AI Necessity, Gate 2 AI Appropriateness | Kept as the two principles the classifier implements | They describe what the rules must achieve rather than checkable yes/no facts |

## 9. Values to confirm before coding

Everything in section 5 is a proposal. The owner of this rubric should be able to defend every threshold aloud before the classifier is written. The three most worth challenging:

1. Rule 3 — should traditional ML require moderate-to-high volume (L ≤ 3)?
2. The overlay — should deterministic software ever get a human in the loop?
3. The agentic bar of T ≤ 3 — too cautious, or not cautious enough?
