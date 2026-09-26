import type { Mvp } from "@/lib/build-mvp";
import { looks, lookCss, type Look } from "@/content/looks";

// Journey 1 content.
// This file holds the words only. The layout lives in app/page.tsx.
// To change what a learner reads, edit the text inside the quotes below.
// You never need to touch app/page.tsx to change wording.

// The shape every step must follow. TypeScript checks this for you:
// if a step is missing a required part, `npm run build` fails and says which one.
export type Step = {
  title: string; // short name of the step
  concept: string; // the one idea this step introduces
  problem: string; // the problem the learner runs into
  idea: string; // the short explanation
  diagram?: string; // optional text diagram
  action: string; // what to do
  code?: string; // optional commands or file contents to type
  result: string; // what they should see
  link?: { href: string; label: string }; // optional live example
  why: string; // the reflection: why this matters
  snag?: string; // optional: where people really get stuck
  // Optional: a few ready-made files to choose from, instead of one block of code.
  choices?: { name: string; mood: string; code: string; look: Look }[];
  // Optional: how this step changes once the learner has chosen their app.
  // Returns only the parts that change; everything else stays as written.
  personalize?: (mvp: Mvp) => Partial<Omit<Step, "personalize">>;
};

export type Journey = {
  number: number;
  title: string;
  promise: string;
  outcome: string[];
  steps: Step[];
  // Shown after the last step: what they have, what it still can't do,
  // and three small things to try. Closure, honestly.
  closing: {
    have: string[];
    notYet: string[];
    tryNext: { title: string; text: string }[];
  };
  next: { title: string; teaser: string };
};

export const journey01: Journey = {
  number: 1,
  title: "How does an app talk to an AI model?",
  promise:
    "Build a real web app that asks an AI model a question and checks the answer before trusting it. No coding experience needed — each step introduces one idea, when you need it.",
  outcome: [
    "A live website with a screen people can actually use",
    "An answer from an AI model, checked before it is shown",
    "Your API key kept safely off the internet",
    "Code you can explain line by line",
  ],
  steps: [
    {
      title: "Start with the end",
      concept: "The shape of an AI app",
      problem:
        "You want to build an AI tool, but you don't know where to begin — or even what the pieces are.",
      idea:
        "Almost every AI tool has the same three parts: a page the user sees, your server in the middle, and an AI model somewhere on the internet. Your server holds a secret key and passes messages between the other two. Every step in this journey builds one piece of this picture.",
      diagram:
        "you ──▶ your app's page ──▶ your server ──▶ AI model\n                             (holds a secret key)",
      action:
        "Open the live demo, paste some text and press Run. That app is the finished version of what you're about to build.",
      result:
        "An answer from a real model, checked before it appeared. The steps below build exactly that app from an empty folder, and the last one gives it your own look.",
      link: { href: "/demo", label: "Open the live demo" },
      why: "Knowing where you're heading makes every step make sense. When you get stuck later, find your place on this picture.",
      personalize: (mvp) => {
        const lead = `${mvp.audience} ──▶ your app's page ──▶ `;
        return {
          diagram: `${lead}your server ──▶ AI model\n${" ".repeat(lead.length)}(holds a secret key)`,
          action: `You're building ${mvp.name}: a ${mvp.patternName.toLowerCase()} tool for ${mvp.audience}. It already exists — open it, paste something in and press Run.`,
          result: `${mvp.resultShownAs.charAt(0).toUpperCase()}${mvp.resultShownAs.slice(1)}. Behind the screen the model's answer arrives as JSON (${mvp.outputExample}) and is checked before anything is shown.`,
          link: { href: mvp.demoHref, label: `Open ${mvp.name}` },
        };
      },
    },
    {
      title: "Choose a model to talk to",
      concept: "AI models · APIs",
      problem:
        "There are many AI models — OpenAI's, Anthropic's Claude, Google's Gemini. Which one? And how does your app reach it, when it runs on someone else's computers?",
      idea:
        "Every model provider publishes an API: a door with rules. Send a request in their format, get a response back. They all work the same way, so learning one teaches you the rest. This journey uses Google's Gemini because its free tier needs no credit card.",
      diagram: "your app  ──request──▶  Gemini API\n          ◀──response──",
      action:
        "Open aistudio.google.com, sign in with a Google account, and try any prompt. Each time you press Run, the page sends an API request for you. By the end of this journey, your own app will send it.",
      result: "Gemini answers your prompt.",
      why: "Every AI product — chat apps, copilots, agents — is built on this one move: send a request, get a response.",
    },
    {
      title: "Get a place to run code",
      concept: "Node.js · VS Code · the terminal",
      problem:
        "Your app is code. Code needs somewhere to be written, and something to run it.",
      idea:
        "VS Code is where you write code. Node.js runs it on your computer. The terminal is where you type instructions to your computer instead of clicking.",
      action:
        "Install Node.js (choose the LTS version) from nodejs.org, and VS Code from code.visualstudio.com. Open VS Code, then View → Terminal, and type:",
      code: "node -v\nnpm -v",
      result: "Two version numbers, such as v24.21.0 and 11.19.0. If you see 'not recognised', close VS Code and open it again — it needs a restart to find newly installed programs.",
      why: "You now have the same basic setup professional developers use. All of it is free.",
      snag: "Some AI coding editors ask for payment upfront. You don't need one. VS Code is free, and a free assistant such as Gemini CLI, or any chat assistant, is enough.",
    },
    {
      title: "Create the app",
      concept: "npm · Next.js",
      problem:
        "Starting from an empty folder means writing thousands of lines before anything works.",
      idea:
        "npm installs ready-made packages of code. Next.js is one of them: a working web app in one command, with pages for visitors and server routes for private work.",
      action:
        "In the terminal, go to the folder where you keep projects, then run the command below. Answer Yes to TypeScript, Yes to App Router, and press Enter for the rest.",
      code: "npx create-next-app@latest my-ai-app\ncd my-ai-app\nnpm install @google/genai zod\nnpm run dev",
      result:
        "Open http://localhost:3000 and you'll see the Next.js starter page, running on your own computer. In VS Code, use File → Open Folder and pick my-ai-app so you can edit it.",
      why: "localhost means \"this computer\". Nobody else can see it yet. That comes in step 10.",
      snag: "On Windows PowerShell, npm and npx may be blocked. Use npm.cmd and npx.cmd instead — every command in this journey works the same way.",
    },
    {
      title: "Prove it's you",
      concept: "API keys · environment variables",
      problem:
        "Google needs to know who is calling — to apply your free quota, and to stop strangers using it.",
      idea:
        "An API key is a password for programs. It goes in a file called .env.local, which your project is set up never to upload.",
      action:
        "At aistudio.google.com/apikey, create a key and copy it. In VS Code, create a new file in your project folder called .env.local with exactly one line — no quotes, no spaces around the = sign:",
      code: "GEMINI_API_KEY=paste-your-key-here",
      result:
        "Nothing visible, and that's the point. Open .gitignore and check it lists .env* — that line is what keeps your key off the internet.",
      why: "A leaked key lets anyone use your quota. While the key has no billing attached, the worst case is that it stops working until the daily limit resets.",
      snag: "Stop the dev server (Ctrl+C) and run npm run dev again. It only reads .env.local at startup, so a key added afterwards is invisible until you restart. This one wastes a lot of people's evening.",
    },
    {
      title: "Keep the key off the browser",
      concept: "Server routes",
      problem:
        "Anything sent to a visitor's browser can be read by that visitor. If your page called Gemini directly, your key would go with it.",
      idea:
        "A server route is code that runs on your server and never in the browser. The browser asks your server; only your server talks to Gemini. Before adding AI, build the route and check it answers.",
      diagram:
        "browser ──▶ your server route ──▶ Gemini\n              (holds the key)\n\nbrowser ──✗──▶ Gemini        never direct",
      action:
        "Create the folders app/api/ask-ai and inside them a file called route.ts, containing exactly this:",
      code:
        "// app/api/ask-ai/route.ts\nexport async function GET() {\n  return Response.json({ ok: true });\n}",
      result: 'Open http://localhost:3000/api/ask-ai and you should see {"ok":true}. Your server just answered a request.',
      why: "This one boundary is how every serious AI product protects its keys. Getting the empty route working first means that when the model call fails later, you know the route itself is fine.",
      snag: "Never name a variable NEXT_PUBLIC_something for a secret. That prefix is an instruction to send the value to the browser.",
    },
    {
      title: "Ask the model",
      concept: "Structured output · JSON",
      problem:
        "Gemini replies in free text. Your app needs data it can use: a specific field, in a known place.",
      idea:
        "Ask for structured output. Tell Gemini to reply in JSON with a fixed shape, such as { \"points\": [...] }. JSON is text that a program can turn into data. Put the call in its own file so both your route and, later, your page can use it.",
      action:
        "Create a folder called lib with a file ask.ts inside it, then point your route at it.",
      code:
        '// lib/ask.ts\nimport { GoogleGenAI } from "@google/genai";\n\nconst ai = new GoogleGenAI({});\n\nexport async function askGemini(text: string) {\n  const response = await ai.models.generateContent({\n    model: "gemini-3.6-flash",\n    contents: `Summarise the following customer complaints into 3 key points.\n\n---\n\n${text}`,\n    config: { responseMimeType: "application/json", temperature: 0 },\n  });\n  return JSON.parse(response.text ?? "{}");\n}\n\n// app/api/ask-ai/route.ts\nimport { askGemini } from "@/lib/ask";\n\nexport async function GET(request: Request) {\n  const text = new URL(request.url).searchParams.get("text") ?? "";\n  return Response.json(await askGemini(text));\n}',
      result:
        'Open http://localhost:3000/api/ask-ai?text=The parcel arrived late and damaged — you should get JSON back, something like {"points":["..."]}.',
      why: "Structured output is what turns a chatbot into a component you can build a product on.",
      personalize: (mvp) => ({
        idea: `Ask for structured output: tell Gemini exactly what shape to reply in. For ${mvp.name}, that shape is ${mvp.outputExample}. Put the call in its own file so both your route and, later, your page can use it.`,
        action: `Create a folder called lib with a file ask.ts inside it. Use your own prompt — the one ${mvp.name} needs — then point your route at it.`,
        code:
          '// lib/ask.ts\nimport { GoogleGenAI } from "@google/genai";\n\nconst ai = new GoogleGenAI({});\n\nexport async function askGemini(text: string) {\n  const response = await ai.models.generateContent({\n    model: "gemini-3.6-flash",\n    contents: `' +
          mvp.prompt +
          '\n\n---\n\n${text}`,\n    config: { responseMimeType: "application/json", temperature: 0 },\n  });\n  return JSON.parse(response.text ?? "{}");\n}\n\n// app/api/ask-ai/route.ts\nimport { askGemini } from "@/lib/ask";\n\nexport async function GET(request: Request) {\n  const text = new URL(request.url).searchParams.get("text") ?? "";\n  return Response.json(await askGemini(text));\n}',
        result: `Open http://localhost:3000/api/ask-ai?text=some+${mvp.input.split(" ")[0]} and you should get ${mvp.outputExample} back.`,
      }),
    },
    {
      title: "Don't trust it blindly",
      concept: "Validation · Zod",
      problem:
        "Asking for JSON doesn't guarantee it. The model can wrap it in extra text, leave out a field, or put a number where text belongs. JSON.parse would then throw, or worse, hand your app the wrong shape.",
      idea:
        "Check the reply before you use it. Zod describes the shape you expect and tests every reply against it. If it doesn't match, ask once more — and tell the model exactly what was wrong. If the second try also fails, say so honestly instead of showing something broken.",
      diagram:
        "Gemini text ──▶ JSON.parse ──▶ Zod check ──✓──▶ your app uses it\n                                   └──✗──▶ retry once with the error, then fail clearly",
      action: "Replace lib/ask.ts with this version:",
      code:
        '// lib/ask.ts\nimport { GoogleGenAI } from "@google/genai";\nimport { z } from "zod";\n\nconst ai = new GoogleGenAI({});\nconst Reply = z.object({ points: z.array(z.string()).length(3) });\n\nasync function callModel(text: string, correction?: string) {\n  const response = await ai.models.generateContent({\n    model: "gemini-3.6-flash",\n    contents: [\n      "Summarise the following customer complaints into 3 key points.",\n      correction ?? "",\n      "---",\n      text,\n    ].filter(Boolean).join("\\n\\n"),\n    config: { responseMimeType: "application/json", temperature: 0 },\n  });\n  try {\n    return JSON.parse(response.text ?? "{}");\n  } catch {\n    return null;\n  }\n}\n\nexport async function askGemini(text: string) {\n  const first = Reply.safeParse(await callModel(text));\n  if (first.success) return { ok: true as const, data: first.data };\n\n  const problem = first.error.issues[0].message;\n  const second = Reply.safeParse(\n    await callModel(text, `Your last reply could not be used (${problem}). Reply again with JSON only.`),\n  );\n  if (second.success) return { ok: true as const, data: second.data };\n\n  return { ok: false as const, error: "The model did not reply in the shape this app expects." };\n}',
      result:
        "The same answer as before, but now your app has checked it. Your route will need a small change: return the result object as it is, and the page in step 11 decides what to show.",
      why: "TypeScript's type checks disappear once the code is running. Zod's check keeps working in production. Good AI products never hand unchecked model output to a user.",
      snag: "Retry only when the reply has the wrong shape, and send the error back to the model. A blind retry on every error just rolls the dice again — and a wrong API key would fail twice, slowly.",
      personalize: (mvp) => ({
        action: `Replace lib/ask.ts with this version. The shape being checked is ${mvp.name}'s own:`,
        code:
          '// lib/ask.ts\nimport { GoogleGenAI } from "@google/genai";\nimport { z } from "zod";\n\nconst ai = new GoogleGenAI({});\nconst Reply = ' +
          mvp.schemaCode +
          ';\n\nasync function callModel(text: string, correction?: string) {\n  const response = await ai.models.generateContent({\n    model: "gemini-3.6-flash",\n    contents: [\n      "' +
          mvp.prompt.replace(/"/g, '\\"') +
          '",\n      correction ?? "",\n      "---",\n      text,\n    ].filter(Boolean).join("\\n\\n"),\n    config: { responseMimeType: "application/json", temperature: 0 },\n  });\n  try {\n    return JSON.parse(response.text ?? "{}");\n  } catch {\n    return null;\n  }\n}\n\nexport async function askGemini(text: string) {\n  const first = Reply.safeParse(await callModel(text));\n  if (first.success) return { ok: true as const, data: first.data };\n\n  const problem = first.error.issues[0].message;\n  const second = Reply.safeParse(\n    await callModel(text, `Your last reply could not be used (${problem}). Reply again with JSON only.`),\n  );\n  if (second.success) return { ok: true as const, data: second.data };\n\n  return { ok: false as const, error: "The model did not reply in the shape this app expects." };\n}',
        result: mvp.validationNote,
      }),
    },
    {
      title: "Save your work",
      concept: "Git · GitHub",
      problem:
        "One bad edit can break everything, and right now your code only exists on one laptop.",
      idea:
        "Git saves snapshots of your project, called commits. GitHub stores them online. create-next-app already started Git for you, so you only need to connect it to GitHub.",
      action:
        "On github.com, press New repository, give it a name, leave every box unticked, and press Create. GitHub then shows you a URL ending in .git — copy it, and run these four commands, pasting your URL into the third one:",
      code:
        'git add .\ngit commit -m "My first AI app"\ngit remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git\ngit push -u origin main',
      result:
        "Refresh the GitHub page and your files are there — with no .env.local among them. Check that, now, before going further.",
      why: "Your commit history is also a record of how you built it. That's useful in an interview.",
      snag: "Commit package.json and package-lock.json along with your code. They tell other computers which packages to install; leave them out and the deploy in the next step fails. On Windows, \"LF will be replaced by CRLF\" warnings are harmless.",
    },
    {
      title: "Put it online",
      concept: "Deployment · Vercel",
      problem: "localhost only works on your own computer.",
      idea:
        "Vercel builds your app from GitHub and hosts it. Every push to GitHub triggers a new build.",
      diagram: "git push ──▶ GitHub ──▶ Vercel builds ──▶ live URL",
      action:
        "Sign in at vercel.com with your GitHub account. Press Add New → Project, find your repository and press Import. Before pressing Deploy, open Environment Variables and add GEMINI_API_KEY with your key as the value. Then press Deploy and wait about a minute.",
      code: "npm run build",
      result:
        "A live URL like https://my-ai-app.vercel.app. Add /api/ask-ai?text=something to it and you should get your JSON answer, from a server anywhere in the world.",
      why: "A link anyone can open. That's a shipped AI app.",
      snag: "Run npm run build on your own computer first — it's the same build Vercel runs, and errors are much easier to read locally. Two Vercel traps: environment variables only apply to builds started after you add them, and the Redeploy button rebuilds the old commit, so new code only goes live when you push it.",
    },
    {
      title: "Give it a face",
      concept: "Your app's screen",
      problem:
        "Your route returns JSON. Nobody wants to read JSON. Right now you have plumbing, not a product.",
      idea:
        "Add a page with a box to paste text and a button. The page calls the same askGemini function your route uses, and shows the answer the way a person wants to read it. No JavaScript is needed in the browser: the form puts the text in the address bar, and the server does the rest.",
      diagram:
        "person types ──▶ your page ──▶ askGemini() ──▶ Gemini\n             ◀── a readable result ◀──",
      action: "Replace everything in app/page.tsx with this:",
      code:
        '// app/page.tsx\nimport { askGemini } from "@/lib/ask";\n\nexport default async function Page({\n  searchParams,\n}: {\n  searchParams: Promise<{ text?: string }>;\n}) {\n  const { text } = await searchParams;\n  const result = text ? await askGemini(text) : null;\n\n  return (\n    <main style={{ maxWidth: 640, margin: "3rem auto", padding: "0 1rem" }}>\n      <h1>Complaint Digest</h1>\n\n      <form>\n        <textarea name="text" rows={8} defaultValue={text} style={{ width: "100%" }} />\n        <button type="submit">Run</button>\n      </form>\n\n      {result?.ok && (\n        <ol>\n          {result.data.points.map((point) => (\n            <li key={point}>{point}</li>\n          ))}\n        </ol>\n      )}\n\n      {result && !result.ok && <p>{result.error}</p>}\n    </main>\n  );\n}',
      result:
        "A screen you would be happy to show someone: paste text, press Run, read the answer. Commit and push, and it is live for everyone.",
      why: "This is where it stops being a demo and becomes a tool someone can use. Everything before this step was plumbing. Working first; the next step makes it look like yours.",
      snag:
        "Your page is public, so every visitor spends your free quota. Before sharing it widely, add a limit or keep the link to people you trust.",
      personalize: (mvp) => ({
        action: `Replace everything in app/page.tsx with this. It is ${mvp.name}'s screen, showing ${mvp.resultShownAs}:`,
        result: `Your own copy of the demo app: paste ${mvp.input}, press Run, and ${mvp.audience} gets ${mvp.resultShownAs}. Commit and push, and it is live for everyone.`,
      }),
    },
    {
      title: "Make it look like yours",
      concept: "Design tokens · CSS",
      problem:
        "Your app works, but it is wearing the browser's default clothes: a plain box and a grey button. People judge a tool in the first second, before they read a word of it.",
      idea:
        "A look is a handful of named values: a background colour, an accent colour, a font, how round the corners are. Designers call them design tokens. You write each value once, at the top of your stylesheet, and every rule underneath uses the name instead of the value. Change one token and the whole page follows. Your page.tsx stays exactly as it is: the stylesheet dresses the plain elements it already uses.",
      diagram:
        "tokens         --accent: #62e3ff\n   │\n   ▼\nrules          button { background: var(--accent) }\n   │\n   ▼\nyour page      every button is that colour",
      action:
        "Pick one of the three looks below. Open app/globals.css, replace everything in it with the look you picked, and save.",
      choices: looks.map((look) => ({ name: look.name, mood: look.mood, code: lookCss(look), look })),
      result:
        "The same tool, dressed in the look you chose, the moment you save. Now change one value inside :root, say --accent, and save again: every button and list marker changes with it. Commit and push, and the new look is live.",
      why: "This is how every design system works, from a two-person startup to Google's Material Design: decisions live in tokens, and screens only refer to them. When a designer talks about the primary colour or the corner radius, they are talking about tokens, and now you can change one yourself.",
      snag:
        "The two @import lines must stay at the top of the file, fonts first. CSS ignores an @import that comes after any other rule, and your page quietly falls back to a plain font. If the font looks wrong, check those lines first.",
      personalize: (mvp) => ({
        result: `${mvp.name}, dressed in the look you chose, the moment you save. Now change one value inside :root, say --accent, and save again: every button and list marker changes with it. Commit and push, and the new look is live.`,
      }),
    },
  ],
  closing: {
    have: [
      "A live URL you can send to anyone: your own AI tool, running on the internet",
      "Five files you can explain line by line — the model call, the check, the route, the screen and its look",
      "A working setup: Node, VS Code, a key, Git and Vercel, all connected",
      "The habit that matters most: never show a user model output you haven't checked",
    ],
    notYet: [
      "No memory and no database. Each run starts from nothing, and nothing is saved.",
      "No limits. Every visitor spends your free quota, so keep the link to people you trust.",
      "Nothing that searches, plans or uses tools. That is what the next journeys are for.",
    ],
    tryNext: [
      {
        title: "Change one line of the prompt",
        text: "Ask for five points instead of three, or a different tone. Run it again. You have just done the cheapest kind of product iteration there is.",
      },
      {
        title: "Break it on purpose",
        text: "Change the Zod check to expect a field the model never sends. Run it, and watch your app refuse the answer instead of showing nonsense. That is the whole lesson of step 8, felt rather than read.",
      },
      {
        title: "Point it at real work",
        text: "Paste something from your actual job — real tickets, real notes, real feedback. Where it fails is more interesting than where it works, and it tells you what a second version would need.",
      },
      {
        title: "Let an AI restyle it, one file only",
        text: "Ask an AI assistant for a look of your own, with one rule: \"Change only app/globals.css. Keep the :root tokens and change their values.\" Then press Run again to prove the tool still works. Giving an AI a small, checkable job is a habit worth more than any look.",
      },
    ],
  },
  next: {
    title: "Journey 2 · When should the model not decide?",
    teaser:
      "Some decisions need an AI model. Many don't. You'll build a tool that scores a task with an LLM, then lets plain code make the call.",
  },
};

// The steps a learner sees. With an MVP, steps that have a personalize()
// swap in their app's details; the rest stay as written.
export function stepsFor(mvp?: Mvp): Array<Step & { personalised: boolean }> {
  return journey01.steps.map((step) => {
    if (!mvp || !step.personalize) return { ...step, personalised: false };
    return { ...step, ...step.personalize(mvp), personalised: true };
  });
}
