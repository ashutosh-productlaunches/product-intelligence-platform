import type { Mvp } from "@/lib/build-mvp";
import { looks, lookCss, type Look } from "@/content/looks";

// Journey 1 content.
// This file holds the words only. The layout lives in app/page.tsx.
// To change what a learner reads, edit the text inside the quotes below.
// You never need to touch app/page.tsx to change wording.

// The shape every step must follow. TypeScript checks this for you:
// if a step is missing a required part, `npm run build` fails and says which one.
// The layers of the app a step touches. Shown on every step as "Where this fits".
export type Layer = "computer" | "page" | "server" | "model" | "internet";

// Every step follows the same pattern:
//   problem → idea → do → you should see → what just happened → PM lens → if this doesn't work
export type Step = {
  title: string; // short name of the step
  concept: string; // the one idea this step introduces
  layers: Layer[]; // where this step sits in the app's architecture
  problem: string; // the problem the learner runs into
  idea: string; // what we're about to do, and why
  diagram?: string; // optional text diagram
  action: string; // what to do
  code?: string; // optional commands or file contents to type
  result: string; // what they should see if it worked
  link?: { href: string; label: string }; // optional live example
  understand: string; // what just happened, technically
  pmLens: string; // why a product manager should care, in two or three sentences
  fails?: { causes: string[]; fix: string }; // if this doesn't work: likely causes, then the most likely fix
  snag?: string; // optional: where people really get stuck
  // Optional: a few ready-made files to choose from, instead of one block of code.
  choices?: { name: string; mood: string; code: string; look: Look }[];
  // Optional: how this step changes once the learner has chosen their app.
  // Returns only the parts that change; everything else stays as written.
  personalize?: (mvp: Mvp) => Partial<Omit<Step, "personalize">>;
};

export type Journey = {
  number: number;
  name: string; // what the learner builds, in a few words
  title: string; // the question the journey answers
  promise: string;
  outcome: string[];
  // The route through the journey, in stages. `steps` are 1-based and inclusive.
  phases: { title: string; summary: string; steps: [number, number] }[];
  steps: Step[];
  // Shown after the last step: what they built, the architecture, the pattern they can
  // reuse, the questions they can now answer, what it still can't do, and things to try.
  closing: {
    intro: string;
    built: { text: string; step: number }[];
    flow: { label: string; note: string }[];
    pattern: { stages: string[]; examples: { name: string; input: string; output: string; note?: string }[] };
    questions: { q: string; step: number }[];
    notYet: string[];
    tryNext: { title: string; text: string }[];
  };
  next: { title: string; teaser: string };
};

export const journey01: Journey = {
  number: 1,
  name: "Build your first AI application",
  title: "How does an app talk to an AI model?",
  promise: "From an empty folder to a live URL, one layer at a time. No coding experience needed.",
  outcome: [
    "A live website with a screen people can actually use",
    "An answer from an AI model, checked before it is shown",
    "Your API key kept safely off the internet",
    "Code you can explain line by line",
  ],
  phases: [
    { title: "See the whole shape", summary: "What an AI app is made of, and how it reaches a model.", steps: [1, 2] },
    { title: "Set up a real project", summary: "The tools engineers use, a running app and a secret key.", steps: [3, 5] },
    { title: "Build the AI core", summary: "A server route that calls the model, asks for structure and checks the answer.", steps: [6, 8] },
    { title: "Ship it", summary: "Version control, then a live URL anyone can open.", steps: [9, 10] },
    { title: "Make it a product", summary: "A screen people can use, in a look you choose.", steps: [11, 12] },
  ],
  steps: [
    {
      title: "Start with the end",
      concept: "The shape of an AI app",
      layers: ["page", "server", "model"],
      problem: "You want to build an AI tool but don't know what the pieces are.",
      idea: "Most AI tools have three parts: a page, a server that holds a secret key, and a model on the internet. Each step builds one of them.",
      diagram:
        "you ──▶ your app's page ──▶ your server ──▶ AI model\n                             (holds a secret key)",
      action: "Open the live demo, paste some text and press Run. It's the finished version of what you'll build.",
      result: "A real model's answer, checked before it appeared.",
      link: { href: "/demo", label: "Open the live demo" },
      understand: "That's the architecture of most AI products: page → server (holds the key) → model. When you get stuck later, find your place on this picture.",
      pmLens: "Cost, speed and safety decisions are almost always about one of these three boxes.",
      personalize: (mvp) => {
        const lead = `${mvp.audience} ──▶ your app's page ──▶ `;
        return {
          diagram: `${lead}your server ──▶ AI model\n${" ".repeat(lead.length)}(holds a secret key)`,
          action: `You're building ${mvp.name}, a ${mvp.patternName.toLowerCase()} tool for ${mvp.audience}. Open it, paste something in and press Run.`,
          result: `${mvp.resultShownAs.charAt(0).toUpperCase()}${mvp.resultShownAs.slice(1)}, from JSON like ${mvp.outputExample} that was checked first.`,
          link: { href: mvp.demoHref, label: `Open ${mvp.name}` },
        };
      },
    },
    {
      title: "Choose a model to talk to",
      concept: "AI models · APIs",
      layers: ["model"],
      problem: "Your app needs to reach a model that runs on someone else's computers.",
      idea: "Every provider (OpenAI, Anthropic, Google) publishes an API: send a request in their format, get a response. Learn one and you know them all. We use Gemini because its free tier needs no card.",
      diagram: "your app  ──request──▶  Gemini API\n          ◀──response──",
      action: "Sign in at aistudio.google.com and run any prompt. Each Run sends an API request. By the end, your app will send it.",
      result: "Gemini answers your prompt.",
      understand: "An LLM is a model trained on huge amounts of text to predict what comes next. It runs on the provider's servers. The API is the contract for reaching it: request in, response out.",
      pmLens: "Model choice trades quality against speed, cost and capabilities. The architecture is the same across providers, so the model call lives in one swappable file (step 7).",
      fails: {
        causes: [
          "A work or school Google account, with AI Studio switched off by an admin.",
          "AI Studio isn't available in your country.",
        ],
        fix: "Use a personal Google account. Failing that, any provider with a free tier works; only steps 5 and 7 change.",
      },
    },
    {
      title: "Get a place to run code",
      concept: "Node.js · VS Code · the terminal",
      layers: ["computer"],
      problem: "Code needs somewhere to be written and something to run it.",
      idea: "VS Code is where you write code. Node.js runs it. The terminal is where you type commands. Git records versions.",
      action: "Install Node.js (LTS) from nodejs.org, VS Code from code.visualstudio.com and, on Windows, Git from git-scm.com. A Mac offers to install Git the first time you run git --version. In VS Code, open View → Terminal and run:",
      code: "node -v\nnpm -v\ngit --version",
      result: "Three version numbers, e.g. v24.21.0, 11.19.0 and git version 2.50.1.",
      understand: "Node.js runs JavaScript outside the browser: on your computer now, on Vercel's servers later. npm comes with it and downloads code packages.",
      pmLens: "\"Works on my machine\" bugs live in this layer: different runtimes and versions on different computers.",
      fails: {
        causes: [
          "'not recognised': the terminal was open before you installed.",
          "PowerShell says 'running scripts is disabled'.",
        ],
        fix: "Restart VS Code. If PowerShell blocks npm, type npm.cmd instead.",
      },
      snag: "You don't need a paid AI editor. VS Code is free, and a free assistant such as Gemini CLI is enough.",
    },
    {
      title: "Create the app",
      concept: "npm · Next.js",
      layers: ["computer", "page", "server"],
      problem: "Starting from an empty folder means thousands of lines before anything works.",
      idea: "npm installs ready-made code. Next.js gives you a working web app in one command: pages for visitors, server routes for private work.",
      action: "In the terminal, go to your projects folder and run these one at a time. --yes accepts the recommended setup: TypeScript, App Router, Tailwind.",
      code: "npx create-next-app@latest my-ai-app --yes\ncd my-ai-app\nnpm install @google/genai zod\nnpm run dev",
      result: "The terminal prints Local: http://localhost:3000, then Ready. Open it to see the Next.js starter page, then use File → Open Folder → my-ai-app.",
      understand: "create-next-app wrote a project whose package.json lists its dependencies; npm install added the Gemini library and Zod. Next.js turns files in app/ into pages and files in app/api/ into server routes. localhost means only you can see it, until step 10.",
      pmLens: "A framework is costly to reverse: it decides where code runs and which engineers you can hire.",
      fails: {
        causes: [
          "'Could not read package.json' or 'Missing script: dev': you're not in the project folder.",
          "'Port 3000 is in use': open the port the terminal prints instead.",
          "'Another next dev server is already running': stop the old one with Ctrl+C in its terminal.",
        ],
        fix: "Run cd my-ai-app first, and use the address the terminal prints.",
      },
      snag: "If Windows PowerShell blocks npm or npx, use npm.cmd and npx.cmd.",
    },
    {
      title: "Prove it's you",
      concept: "API keys · environment variables",
      layers: ["server"],
      problem: "Google needs to know who's calling, to apply your quota and keep strangers out.",
      idea: "An API key is a password for programs. It goes in .env.local, a file your project never uploads.",
      action: "Create a key at aistudio.google.com/apikey. In your project folder, create a file called .env.local with one line, no quotes or spaces:",
      code: "GEMINI_API_KEY=paste-your-key-here",
      result: "Nothing visible. Check that .gitignore lists .env*: that line keeps the key off GitHub.",
      understand: "Next.js loads .env.local as environment variables when the server starts, and the Gemini library reads GEMINI_API_KEY from there. The key sits outside the code, so the code can be shared safely.",
      pmLens: "Every new third-party service raises one question: where does its key live? A leaked key costs quota or, with billing on, money.",
      fails: {
        causes: [
          "The dev server was running before you created the file. It reads .env.local only at startup.",
          "Windows saved it as .env.local.txt. Turn on View → File name extensions to check.",
          "The file isn't next to package.json.",
        ],
        fix: "Restart the dev server: Ctrl+C, then npm run dev. You'll usually notice in step 7, when Gemini rejects the key.",
      },
    },
    {
      title: "Keep the key off the browser",
      concept: "Server routes",
      layers: ["page", "server"],
      problem: "Anything sent to the browser can be read by the visitor, including a key.",
      idea: "A server route runs only on your server. The browser asks your server; only your server talks to Gemini. Build the route first, the AI second.",
      diagram:
        "browser ──▶ your server route ──▶ Gemini\n              (holds the key)\n\nbrowser ──✗──▶ Gemini        never direct",
      action:
        "Create the folders app/api/ask-ai and inside them a file called route.ts, containing exactly this:",
      code:
        "// app/api/ask-ai/route.ts\nexport async function GET() {\n  return Response.json({ ok: true });\n}",
      result: "Open http://localhost:3000/api/ask-ai and you should see {\"ok\":true}.",
      understand: "Any route.ts under app/api/ is a server route. The browser gets its answer, never its code or secrets. With the empty route working, any later failure is in the model call.",
      pmLens: "What runs on the server and what runs in the browser decides security, speed and cost. Ask it about every AI feature.",
      fails: {
        causes: [
          "404: the file isn't exactly app/api/ask-ai/route.ts. Often it's named ask-ai.ts.",
          "Your project has a src folder: use src/app/api/ask-ai/route.ts.",
        ],
        fix: "Compare the path in VS Code's explorer, letter by letter.",
      },
      snag: "Never name a secret NEXT_PUBLIC_…: that prefix sends it to the browser.",
    },
    {
      title: "Ask the model",
      concept: "Structured output · JSON",
      layers: ["server", "model"],
      problem: "Gemini replies in prose. Your app needs data in a known place.",
      idea: "Ask for structured output: JSON in a fixed shape, like { \"points\": [...] }. Put the call in its own file so the route and, later, the page can share it.",
      action: "Create lib/ask.ts, then point your route at it.",
      code:
        '// lib/ask.ts\nimport { GoogleGenAI } from "@google/genai";\n\nconst ai = new GoogleGenAI({});\n\nexport async function askGemini(text: string) {\n  const response = await ai.models.generateContent({\n    model: "gemini-3.6-flash",\n    contents: `Summarise the following customer complaints into 3 key points.\n\n---\n\n${text}`,\n    config: { responseMimeType: "application/json", temperature: 0 },\n  });\n  return JSON.parse(response.text ?? "{}");\n}\n\n// app/api/ask-ai/route.ts\nimport { askGemini } from "@/lib/ask";\n\nexport async function GET(request: Request) {\n  const text = new URL(request.url).searchParams.get("text") ?? "";\n  return Response.json(await askGemini(text));\n}',
      result: "Open http://localhost:3000/api/ask-ai?text=The parcel arrived late and damaged. You should get JSON like {\"points\":[\"...\"]}.",
      understand: "The route reads the text, sends it with your prompt and returns Gemini's JSON. responseMimeType asks for JSON, temperature 0 reduces randomness, and JSON.parse turns text into data.",
      pmLens: "If product logic depends on the answer, such as routing a ticket or saving a field, the shape must be predictable. Asking for structure is the cheapest guardrail.",
      fails: {
        causes: [
          "'API key not valid': the key isn't loaded (step 5).",
          "'Model not found': a typo in the model name.",
          "429: the free-tier limit. Wait a minute.",
          "A JSON.parse error: the reply wasn't clean JSON. Step 8 fixes this.",
        ],
        fix: "Read the terminal running npm run dev, not the browser: server errors print there.",
      },
      personalize: (mvp) => ({
        idea: `Ask for structured output. For ${mvp.name}, the shape is ${mvp.outputExample}. Put the call in its own file so the route and, later, the page can share it.`,
        action: `Create lib/ask.ts with ${mvp.name}'s own prompt, then point your route at it.`,
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
      layers: ["server"],
      problem: "Asking for JSON doesn't guarantee it. Fields go missing and types come back wrong.",
      idea: "Check every reply with Zod. If it fails, retry once and tell the model what was wrong. If it fails again, say so.",
      diagram:
        "Gemini text ──▶ JSON.parse ──▶ Zod check ──✓──▶ your app uses it\n                                   └──✗──▶ retry once with the error, then fail clearly",
      action: "Replace lib/ask.ts with this version:",
      code:
        '// lib/ask.ts\nimport { GoogleGenAI } from "@google/genai";\nimport { z } from "zod";\n\nconst ai = new GoogleGenAI({});\nconst Reply = z.object({ points: z.array(z.string()).length(3) });\n\nasync function callModel(text: string, correction?: string) {\n  const response = await ai.models.generateContent({\n    model: "gemini-3.6-flash",\n    contents: [\n      "Summarise the following customer complaints into 3 key points.",\n      correction ?? "",\n      "---",\n      text,\n    ].filter(Boolean).join("\\n\\n"),\n    config: { responseMimeType: "application/json", temperature: 0 },\n  });\n  try {\n    return JSON.parse(response.text ?? "{}");\n  } catch {\n    return null;\n  }\n}\n\nexport async function askGemini(text: string) {\n  const first = Reply.safeParse(await callModel(text));\n  if (first.success) return { ok: true as const, data: first.data };\n\n  const problem = first.error.issues[0].message;\n  const second = Reply.safeParse(\n    await callModel(text, `Your last reply could not be used (${problem}). Reply again with JSON only.`),\n  );\n  if (second.success) return { ok: true as const, data: second.data };\n\n  return { ok: false as const, error: "The model did not reply in the shape this app expects." };\n}',
      result: "The same answer, now checked. Return the result object from your route as it is; the page in step 11 decides what to show.",
      understand: "Zod describes the expected shape; safeParse returns the data or what's wrong, without crashing. That's what happens when the AI fails: detect, retry once, then fail honestly. Unlike TypeScript types, this check runs in production.",
      pmLens: "Models are probabilistic, so decide upfront what the product does when they fail: retry, fall back or tell the user. Never show unchecked output.",
      fails: {
        causes: [
          "'Cannot find module zod': run npm install zod.",
          "Every run fails: the prompt and the schema disagree, e.g. five points asked for, three expected.",
        ],
        fix: "Read the Zod error in the terminal. It names the field.",
      },
      snag: "Retry only on a wrong shape, with the error attached. A blind retry just rolls the dice again.",
      personalize: (mvp) => ({
        action: `Replace lib/ask.ts with this version, which checks ${mvp.name}'s own shape:`,
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
      layers: ["computer", "internet"],
      problem: "One bad edit can break everything, and your code lives on one laptop.",
      idea: "Git saves snapshots called commits. GitHub stores them online.",
      action: "On github.com, create a New repository (leave the boxes unticked) and copy its .git URL. First time on this computer? Run the two config lines. Then run the rest, with your URL in the third:",
      code:
        'git config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\n\ngit add .\ngit commit -m "My first AI app"\ngit remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git\ngit push -u origin main',
      result: "You sign in to GitHub once, and the push ends with branch 'main' set up to track 'origin/main'. Refresh GitHub: your files are there and .env.local is not. Check that now.",
      understand: "add picks the files, commit snapshots them on your computer, push copies them to GitHub, where Vercel and collaborators can read them. .gitignore keeps .env.local behind.",
      pmLens: "Reviews, releases and rollbacks all run through Git. \"Which commit broke this?\" becomes a question you can ask, and your history shows how you built it.",
      fails: {
        causes: [
          "'Author identity unknown': run the git config lines.",
          "'src refspec main does not match any': commit first, or run git branch -M main.",
          "Authentication failed: sign in through the pop-up window, not with a password.",
        ],
        fix: "Run git status: it shows your branch and what's uncommitted.",
      },
      snag: "Commit package.json and package-lock.json too, or the deploy fails. CRLF warnings on Windows are harmless.",
    },
    {
      title: "Put it online",
      concept: "Deployment · Vercel",
      layers: ["internet", "server"],
      problem: "localhost only works on your computer.",
      idea: "Vercel builds your app from GitHub and hosts it. Every push triggers a new build.",
      diagram: "git push ──▶ GitHub ──▶ Vercel builds ──▶ live URL",
      action: "Run the build below on your own computer first: it catches errors early. Then, at vercel.com, sign in with GitHub, choose Add New → Project and import your repository. Before pressing Deploy, add GEMINI_API_KEY under Environment Variables.",
      code: "npm run build",
      result: "A live URL like https://my-ai-app.vercel.app. Add /api/ask-ai?text=hello to get JSON from a server anywhere.",
      understand: "Vercel runs npm install and npm run build on its servers and serves the result publicly. Its environment variable replaces .env.local. Each push builds a new version, which goes live if the build succeeds.",
      pmLens: "A prototype isn't a product until people can reach it reliably. Knowing how a push goes live shortens every release conversation.",
      fails: {
        causes: [
          "The build fails: usually a TypeScript error. npm run build shows it locally.",
          "The AI call fails live: GEMINI_API_KEY is missing, or was added after the build.",
          "404 on /api/ask-ai: the route file wasn't committed.",
        ],
        fix: "Read the Vercel build log from the top. The first error is the real one.",
      },
      snag: "Environment variables only apply to builds after you add them, and Redeploy rebuilds the old commit. New code goes live only when you push.",
    },
    {
      title: "Give it a face",
      concept: "Your app's screen",
      layers: ["page", "server"],
      problem: "Your route returns JSON. Nobody wants to read JSON.",
      idea: "Add a page with a text box and a button. It calls askGemini on the server and shows a readable result. No browser JavaScript needed.",
      diagram:
        "person types ──▶ your page ──▶ askGemini() ──▶ Gemini\n             ◀── a readable result ◀──",
      action: "Replace everything in app/page.tsx with this:",
      code:
        '// app/page.tsx\nimport { askGemini } from "@/lib/ask";\n\nexport default async function Page({\n  searchParams,\n}: {\n  searchParams: Promise<{ text?: string }>;\n}) {\n  const { text } = await searchParams;\n  const result = text ? await askGemini(text) : null;\n\n  return (\n    <main style={{ maxWidth: 640, margin: "3rem auto", padding: "0 1rem" }}>\n      <h1>Complaint Digest</h1>\n\n      <form>\n        <textarea name="text" rows={8} defaultValue={text} style={{ width: "100%" }} />\n        <button type="submit">Run</button>\n      </form>\n\n      {result?.ok && (\n        <ol>\n          {result.data.points.map((point) => (\n            <li key={point}>{point}</li>\n          ))}\n        </ol>\n      )}\n\n      {result && !result.ok && <p>{result.error}</p>}\n    </main>\n  );\n}',
      result: "Paste text, press Run, read the answer. Push, and it's live.",
      understand: "The page is a server component: it runs on the server, calls askGemini directly and sends finished HTML. The form puts ?text=… in the address, and the server reads it and renders the result.",
      pmLens: "The model isn't the product; the experience is. What people type, wait for and see when it fails decides whether they trust it.",
      fails: {
        causes: [
          "Nothing appears after Run: lib/ask.ts is still the step 7 version.",
          "A few seconds' wait is normal: that's the model call.",
        ],
        fix: "Use the step 8 lib/ask.ts, then check the terminal for errors.",
      },
      snag: "Your page is public, so visitors spend your free quota. Share the link carefully until you add a limit.",
      personalize: (mvp) => ({
        action: `Replace everything in app/page.tsx with ${mvp.name}'s screen:`,
        result: `Paste ${mvp.input}, press Run, and ${mvp.audience} gets ${mvp.resultShownAs}. Push, and it's live.`,
      }),
    },
    {
      title: "Make it look like yours",
      concept: "Design tokens · CSS",
      layers: ["page"],
      problem: "It works, but it wears the browser's default look. People judge a tool before they read it.",
      idea: "A look is a few design tokens (colours, fonts, corner radius) defined once and used everywhere. Change a token and the whole page follows. page.tsx doesn't change.",
      diagram:
        "tokens         --accent: #62e3ff\n   │\n   ▼\nrules          button { background: var(--accent) }\n   │\n   ▼\nyour page      every button is that colour",
      action: "Pick a look, replace everything in app/globals.css with it, and save.",
      choices: looks.map((look) => ({ name: look.name, mood: look.mood, code: lookCss(look), look })),
      result: "Your tool in the new look. Change --accent and save: every button follows. Push to publish.",
      understand: "Lines starting with -- are CSS custom properties, the tokens; var(--accent) reads one. The rules target plain elements, so one file restyles the whole page.",
      pmLens: "Designers talk in tokens: primary colour, radius. Tokens are also why a rebrand can ship in a day.",
      fails: {
        causes: [
          "The font looks plain: the @import lines aren't at the top of the file.",
          "Nothing changed: wrong file, or the browser is showing an old copy.",
          "The look is half applied: you pasted below the old CSS instead of replacing it.",
        ],
        fix: "Replace the whole file, save, and hard-refresh (Ctrl+Shift+R).",
      },
      personalize: (mvp) => ({
        result: `${mvp.name} in the new look. Change --accent and save: every button follows. Push to publish.`,
      }),
    },
  ],
  closing: {
    intro: "An app you can explain file by file, change and ship again.",
    built: [
      { text: "Talks to a large language model through a real API", step: 7 },
      { text: "Keeps its API key on the server, out of the browser and off GitHub", step: 5 },
      { text: "Runs its own server logic in a route you wrote", step: 6 },
      { text: "Asks the model for structured output, not free text", step: 7 },
      { text: "Checks every answer before using it, and fails honestly", step: 8 },
      { text: "Is version-controlled, with its history on GitHub", step: 9 },
      { text: "Is deployed and reachable by anyone with the link", step: 10 },
      { text: "Has a screen people can use", step: 11 },
      { text: "Has a look you chose, set by design tokens", step: 12 },
    ],
    flow: [
      { label: "Person", note: "types or pastes text" },
      { label: "Your page", note: "app/page.tsx, a form" },
      { label: "Your server", note: "Next.js, holds the key" },
      { label: "The model", note: "Gemini, through its API" },
      { label: "Structured reply", note: "JSON in a fixed shape" },
      { label: "Validation", note: "Zod: use it, retry, or fail" },
      { label: "Person", note: "sees a checked answer" },
    ],
    pattern: {
      stages: ["Input", "Your app", "AI model", "Structured output", "Validation", "Screen"],
      examples: [
        { name: "Customer feedback analyser", input: "Survey answers or reviews", output: '{ "themes": [...], "sentiment": "..." }' },
        { name: "PRD summariser", input: "A product requirements doc", output: '{ "problem": "...", "scope": [...], "risks": [...] }' },
        { name: "Support ticket classifier", input: "One ticket", output: '{ "category": one of your list }' },
        { name: "Meeting notes assistant", input: "Raw meeting notes", output: '{ "decisions": [...], "actions": [{ "owner", "task" }] }' },
        { name: "Sales call analyser", input: "A call transcript", output: '{ "objections": [...], "nextStep": "..." }' },
        {
          name: "Competitor research assistant",
          input: "A competitor's name",
          output: '{ "positioning": "...", "pricing": "..." }',
          note: "Needs live web data, so it adds a search tool to this pattern. That's a later journey.",
        },
      ],
    },
    questions: [
      { q: "What is an LLM?", step: 2 },
      { q: "What is an API?", step: 2 },
      { q: "What does Node.js do in this app?", step: 3 },
      { q: "What is Next.js doing for you?", step: 4 },
      { q: "Why must an API key stay on the server?", step: 5 },
      { q: "What is a server route?", step: 6 },
      { q: "How does an application talk to an LLM?", step: 7 },
      { q: "What is structured output, and why ask for it?", step: 7 },
      { q: "Why validate an AI's answer?", step: 8 },
      { q: "What happens when the AI fails?", step: 8 },
      { q: "What is Git?", step: 9 },
      { q: "Why push to GitHub?", step: 9 },
      { q: "How does a git push become a live website?", step: 10 },
      { q: "What does Vercel do?", step: 10 },
      { q: "How could the same architecture power a different AI product?", step: 0 },
    ],
    notYet: [
      "No memory or database: each run starts fresh.",
      "No usage limits: every visitor spends your quota.",
      "No search, planning or tools. Those come in later journeys.",
    ],
    tryNext: [
      { title: "Change one line of the prompt", text: "Ask for five points or a different tone, then run it again. That's the cheapest product iteration there is." },
      { title: "Break it on purpose", text: "Make the Zod check expect a field the model never sends, and watch the app refuse the answer." },
      { title: "Point it at real work", text: "Paste real tickets or notes from your job. Where it fails tells you what version 2 needs." },
      { title: "Let an AI restyle it, one file only", text: "Ask an AI assistant for a new look, allowing changes to app/globals.css only. Then press Run to prove the tool still works." },
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
