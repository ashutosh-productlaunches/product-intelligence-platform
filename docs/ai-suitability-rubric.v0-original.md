# AI Suitability Rubric

This rubric evaluates whether a product problem is better suited to
deterministic software, AI assistance, or a more autonomous AI workflow.

## 1. Nature of Task

What kind of work is being performed?

Tasks that follow a stable, explicit SOP with predictable inputs and
outputs should generally be handled by deterministic software or rules.

AI becomes more relevant when the task involves unstructured inputs,
ambiguity, interpretation, or changing context.

## 2. Determinism

How strictly must the output be repeatable?

Tasks requiring exact, repeatable, rule-based outputs should generally
use deterministic logic. Tasks where some variation is acceptable may
be suitable for LLM-based approaches.

## 3. Reasoning Need

How much interpretation, contextual understanding, or synthesis does
the task require?

Tasks requiring interpretation of ambiguous or unstructured information
may benefit from LLM-based reasoning.

## 4. Data Availability

Does the system have sufficient, relevant, representative, and
trustworthy information to perform the task?

AI output should not be considered reliable merely because a large
amount of data is available.

## 5. Decision Risk

What is the consequence of an incorrect output, and how reversible is
the mistake?

Higher-risk or difficult-to-reverse decisions require stronger
guardrails and potentially human approval.

## 6. Human Involvement

Does the task require human judgment, contextual knowledge,
accountability, or approval?

AI does not necessarily need to replace the human decision-maker.
It may instead assist, recommend, or prepare a decision for human
approval.

## Decision Gates

### Gate 1: AI Necessity

Can the problem be solved adequately with deterministic software,
rules, or conventional automation?

If yes, an LLM should not be introduced solely because it is available.

### Gate 2: AI Appropriateness

If AI is technically useful, are the risk, data, and human-oversight
conditions acceptable for the proposed level of AI autonomy?

Higher-risk decisions may require human review, approval, or stronger
guardrails rather than autonomous AI execution.