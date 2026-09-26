// "Break it": one experiment per build step, the part that makes this a lab.
// experiments01[4] belongs to step 5, experiments01[5] to step 6, and so on.
// Steps without an experiment have `undefined`.
//
// Every experiment follows the same loop:
//   predict (lock in a guess) → change one thing → run it → compare → why → put it back
//
// Only use experiments whose outcome is certain, or say honestly when it can vary.
// Never promise an output the learner won't see.

export type Experiment = {
  title: string; // what they'll break, in a few words
  predict: { q: string; options: string[]; answer: number }; // `answer` is the index of the right option
  change: string; // what to change
  code?: string; // optional: the exact edit or command
  observe: string; // what they'll see
  why: string; // why it happened, technically
  pmLens: string; // why a PM should care
  undo: string; // how to put it back
  ifYourApp?: string; // optional: shown when the learner built their own app and the code differs
};

export const experiments01: (Experiment | undefined)[] = [
  // 1 · Start with the end
  undefined,
  // 2 · Choose a model to talk to
  undefined,
  // 3 · Get a place to run code
  undefined,
  // 4 · Create the app
  undefined,

  // 5 · Prove it's you
  {
    title: "Send a wrong key",
    predict: {
      q: "You change one character of the key in .env.local and run try-key.mjs again. What happens?",
      options: [
        "Gemini still answers. The key is just a label.",
        "Google refuses the request with an error about the key.",
        "Gemini answers, just more slowly.",
      ],
      answer: 1,
    },
    change: "Open .env.local, change the last character of your key, save, and run the test again:",
    code: "node --env-file=.env.local try-key.mjs",
    observe: "An error instead of a sentence. Somewhere in it Google says the API key isn't valid.",
    why: "Every request carries the key. Google checks it before the model runs at all: no valid key, no model. That's also how Google counts your quota against you and nobody else.",
    pmLens: "Keys are where quotas, billing and access control live. If a key leaks, the fix is to create a new one and delete the old one, which is why keys belong in one place, not scattered through code.",
    undo: "Put the correct character back and run the test once more. The sentence returns.",
  },

  // 6 · Keep the key off the browser
  {
    title: "Leak a pretend secret",
    predict: {
      q: "Your route reads a secret from .env.local and puts it in its reply. You open /api/ask-ai in the browser. What do you see?",
      options: [
        "Only {\"ok\":true}. Server code keeps secrets hidden automatically.",
        "An error: server routes can't read .env.local.",
        "The secret, in plain text.",
      ],
      answer: 2,
    },
    change: "Add a pretend secret to .env.local (never use your real key for this), restart the dev server with Ctrl+C then npm run dev, and make the route send it back:",
    code: "# .env.local — add this line\nDEMO_SECRET=pretend-this-is-a-key\n\n// app/api/ask-ai/route.ts\nexport async function GET() {\n  return Response.json({ ok: true, leaked: process.env.DEMO_SECRET });\n}",
    observe: "{\"ok\":true,\"leaked\":\"pretend-this-is-a-key\"}. Anyone who opens that URL can read it.",
    why: "The server keeps its code and environment private, but everything it sends back is public. A route is only as safe as its reply.",
    pmLens: "In a security review, the useful question isn't \"is it on the server?\" but \"what does this endpoint return, and to whom?\"",
    undo: "Delete the DEMO_SECRET line and put the route back to return Response.json({ ok: true }).",
  },

  // 7 · Ask the model
  {
    title: "Turn up the randomness",
    predict: {
      q: "You open the same URL three times at temperature 0, then three times at temperature 2. What do you expect?",
      options: [
        "Temperature 0 gives the same words every time, guaranteed. Temperature 2 gives the same too.",
        "Temperature 0 answers look very alike. At 2 the wording and choice of points drift more.",
        "No difference: temperature only changes speed.",
      ],
      answer: 1,
    },
    change: "Open your test URL three times and note the points. Then change temperature: 0 to temperature: 2 in lib/ask.ts, save, and open it three more times. Go slowly: the free tier limits requests per minute.",
    code: 'config: { responseMimeType: "application/json", temperature: 2 },',
    observe: "At 0 the answers are very close, often identical. At 2 the wording shifts and sometimes the points themselves change.",
    why: "The model picks each next word from a list of likely words. Temperature controls how adventurous that pick is. 0 means \"almost always the likeliest word\", but providers don't promise identical output, so never build on exact wording.",
    pmLens: "Same input, different answer is normal for AI. Decide per feature how much variation is acceptable: a creative rewrite can use it, a ticket router can't.",
    undo: "Set temperature back to 0.",
  },

  // 8 · Don't trust it blindly
  {
    title: "Make the check disagree with the prompt",
    predict: {
      q: "The prompt still asks for 3 points, but you change the check to expect exactly 5. What happens when you run it?",
      options: [
        "You get 3 points. Zod only warns.",
        "The page crashes with a red error screen.",
        "The first reply fails the check, and the retry decides: 5 points if the model follows the correction, the honest error if not.",
      ],
      answer: 2,
    },
    change: "In lib/ask.ts, change .length(3) to .length(5), and add one line so you can watch the first check in the terminal:",
    code: "const Reply = z.object({ points: z.array(z.string()).length(5) });\n\n// inside askGemini, right after the first safeParse:\nconsole.log(\"first check passed?\", first.success);",
    observe: "The terminal prints first check passed? false. Then either 5 points come back, because the retry told the model what was wrong, or you get \"The model did not reply in the shape this app expects.\" Either way, nothing crashes and nothing unchecked reaches the screen.",
    why: "safeParse reports a failure instead of throwing, so your code decides what happens next. Attaching the error to the retry gives the model a reason to change its answer. A blind retry would just roll the dice again.",
    pmLens: "A mismatch between prompt and schema is one of the most common real AI bugs: someone edits the prompt, nobody updates the check. Ask who owns both.",
    undo: "Change 5 back to 3 and delete the console.log line.",
    ifYourApp: "Your app's check looks different from this one. Make it expect something your prompt doesn't ask for, such as one more item in a list, and add the same console.log line.",
  },

  // 9 · Save your work
  {
    title: "Delete your AI code, then get it back",
    predict: {
      q: "You delete everything in lib/ask.ts and save. Can you get it back?",
      options: [
        "No. Saving overwrote it.",
        "Yes. Git can restore the version you committed.",
        "Only if you had already pushed to GitHub.",
      ],
      answer: 1,
    },
    change: "Select everything in lib/ask.ts, delete it and save. Your app breaks: the dev terminal shows errors. Then ask Git what changed, and restore it:",
    code: "git status\ngit diff\ngit restore lib/ask.ts",
    observe: "git status lists lib/ask.ts as modified, git diff shows every deleted line, and after git restore the file is back exactly as committed.",
    why: "A commit is a snapshot stored on your own computer, so restoring doesn't need GitHub. Pushing is the backup for when the laptop itself is gone.",
    pmLens: "This is what \"roll it back\" means. Teams that commit small and often can undo a bad change in minutes instead of rebuilding it.",
    undo: "Nothing to undo: git status should now say nothing to commit.",
  },

  // 10 · Put it online
  {
    title: "Push a broken build",
    predict: {
      q: "You push code with a TypeScript error, skipping npm run build. What happens to your live site?",
      options: [
        "It breaks until you push a fix.",
        "The build fails on Vercel, and the live site keeps serving the last version that built.",
        "Vercel fixes the error for you.",
      ],
      answer: 1,
    },
    change: "Add this line to the top of app/api/ask-ai/route.ts, then commit and push. Watch the deployment on your Vercel dashboard, then open your live URL:",
    code: '// top of app/api/ask-ai/route.ts\nconst broken: number = "oops";\n\ngit add .\ngit commit -m "Break the build on purpose"\ngit push',
    observe: "The new deployment shows Error, with a type error in the build log. Your live URL still works, running the previous version.",
    why: "Vercel builds each push separately and only switches the live URL once a build succeeds. A failed build never replaces the working one.",
    pmLens: "A failed deploy isn't an outage; a successful deploy of bad code is. That's why teams add checks before code goes live, not after.",
    undo: "Delete the line, then git add ., git commit -m \"Fix the build\" and git push. The next deployment goes green.",
  },

  // 11 · Give it a face
  undefined,
  // 12 · Make it look like yours
  undefined,
];
