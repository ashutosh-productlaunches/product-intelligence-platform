// Feedback from the /why page: the shape we accept, and the row we write to the sheet.
//
// The form runs in the visitor's browser, so nothing it sends can be trusted.
// The server route checks every field with this schema before anything is saved.
// Pure functions: no network, no storage.
import { z } from "zod";
import { why } from "@/content/why";

const roles = why.form.roles.map((r) => r.value) as [string, ...string[]];
const nexts = why.form.next.map((n) => n.value) as [string, ...string[]];

export const Feedback = z.object({
  role: z.enum(roles),
  next: z.enum(nexts),
  message: z.string().trim().min(3, "Please write a few words.").max(1500, "Please keep it under 1,500 characters."),
  email: z.union([z.literal(""), z.email().max(200)]).default(""),
  step: z.string().max(20).default(""), // how far the visitor got, e.g. "7" or "done"
  page: z.string().max(100).default(""),
  website: z.string().max(500).default(""), // a hidden field people never see; bots fill it in (the route checks it)
});
export type Feedback = z.infer<typeof Feedback>;

// One row for the sheet, in the same order as its header row:
// Received at · Role · Want next · Message · Step reached · Email (optional) · Page
export function toRow(f: Feedback, receivedAt: Date): string[] {
  const label = <T extends { value: string; label: string }>(list: readonly T[], v: string) =>
    list.find((x) => x.value === v)?.label ?? v;
  return [
    receivedAt.toISOString(),
    label(why.form.roles, f.role),
    label(why.form.next, f.next),
    f.message,
    f.step,
    f.email,
    f.page,
  ];
}
