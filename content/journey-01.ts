// Journey 1 content.
// This file holds the words only. The layout lives in app/page.tsx.
// To change what a learner reads, edit the text inside the quotes below.
// You never need to touch app/page.tsx to change wording.

import type { Mvp } from "@/lib/build-mvp";

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
  next: { title: string; teaser: string };
};

export const journey01: Journey = {
  number: 1,
  title: "How does an app talk to an AI model?",
  promise:
    "Build a real web app that asks Gemini a question and checks the answer before trusting it. No coding experience needed — each step introduces one idea, when you need it.",
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
        "Open the finished version of what you're about to build. It asks an AI model a question and shows the answer it got back.",
      result:
        "A plain-looking answer in a format called JSON. That is the machine-readable half of an app: the part other programs talk to. Step 11 gives it a screen people can use.",
      link: { href: "/api/ask-ai", label: "Open the raw answer" },
      why: "Knowing where you're heading makes every step make sense. When you get stuck later, find your place on this picture.",
      personalize: (mvp) => {
        const lead = `${mvp.audience} ──▶ your app's page ──▶ `;
        return {
          diagram: `${lead}your server ──▶ AI model\n${" ".repeat(lead.length)}(holds a secret key)`,
          action: `You're building ${mvp.name}: a ${mvp.patternName.toLowerCase()} tool for ${mvp.audience}. The picture above the steps shows the screen you'll end up with.`,
          result: `Behind that screen, the model's answer arrives as JSON: ${mvp.outputExample}. Step 11 turns it into ${mvp.resultShownAs}.`,
          link: { href: "#preview", label: "See the screen you'll build" },
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
        "Open Google AI Studio and try any prompt. Each time you press Run, the page sends an API request for you. By the end of this journey, your own app will send it.",
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
        "Install Node.js (the LTS version) and VS Code. In VS Code, open View → Terminal and type:",
      code: "node -v",
      result: "A version number, such as v24.21.0.",
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
      action: "In the terminal:",
      code: "npx create-next-app@latest my-ai-app\ncd my-ai-app\nnpm run dev",
      result:
        "Open http://localhost:3000 and you'll see the Next.js starter page, running on your own computer.",
      why: "localhost means \"this computer\". Nobody else can see it yet. That comes in step 10.",
      snag: "On Windows PowerShell, npm and npx may be blocked. Use npm.cmd and npx.cmd instead.",
    },
    {
      title: "Prove it's you",
      concept: "API keys · environment variables",
      problem:
        "Google needs to know who is calling — to apply your free quota, and to stop strangers using it.",
      idea:
        "An API key is a password for programs. It goes in a file called .env.local, which your project is set up never to upload.",
      action:
        "Create a key in Google AI Studio. In your project folder, create a file named .env.local containing one line:",
      code: "GEMINI_API_KEY=paste-your-key-here",
      result:
        "Nothing visible, and that's the point. Open .gitignore and check it lists .env*.",
      why: "A leaked key lets anyone use your quota. While the key has no billing attached, the worst case is that it stops working until the daily limit resets.",
      snag: "\"Don't share your key\" means don't paste it into a chat, a message or a code file. Storing it in your own server's settings later (step 10) is not sharing it.",
    },
    {
      title: "Keep the key off the browser",
      concept: "Server routes",
      problem:
        "Anything sent to a visitor's browser can be read by that visitor. If the page called Gemini directly, your key would go with it.",
      idea:
        "Put the call in a server route: code that runs on your server, never in the browser. The browser asks your server. Only your server talks to Gemini.",
      diagram:
        "browser ──▶ your server route ──▶ Gemini\n              (holds the key)\n\nbrowser ──✗──▶ Gemini        never direct",
      action:
        "Install Google's library and a validation library, then create the file app/api/ask-ai/route.ts. Ask your AI assistant to help write it, then read every line and have it explain anything you can't.",
      code: "npm install @google/genai zod",
      result: "The route file exists. Nothing runs yet.",
      why: "This one boundary is how every serious AI product protects its keys.",
      snag: "Never name the variable NEXT_PUBLIC_something. That prefix tells Next.js to send the value to the browser.",
    },
    {
      title: "Get an answer back",
      concept: "Structured output · JSON",
      problem:
        "Gemini replies in free text. Your app needs data it can use: a specific field, in a known place.",
      idea:
        "Ask for structured output. Tell Gemini to reply in JSON with a fixed shape, such as { \"answer\": \"...\" }. JSON is text that a program can turn into data.",
      action:
        "In your route, ask Gemini for JSON with an answer field. Start the app and open http://localhost:3000/api/ask-ai.",
      result: "Something like: {\"answer\":\"A Large Language Model is ...\"}",
      link: { href: "/api/ask-ai", label: "See the live version of this route" },
      why: "Structured output is what turns a chatbot into a component you can build a product on.",
      personalize: (mvp) => ({
        idea: `Ask for structured output: tell Gemini exactly what shape to reply in. For ${mvp.name}, that shape is ${mvp.outputExample}. JSON is text that a program can turn into data.`,
        action: `In your route, send Gemini this prompt, followed by the ${mvp.input} you want it to work on:`,
        code: mvp.prompt,
        result: `Something like: ${mvp.outputExample}`,
      }),
    },
    {
      title: "Don't trust it blindly",
      concept: "Validation · Zod",
      problem:
        "Asking for JSON doesn't guarantee it. The model can wrap it in extra text, leave out a field, or put a number where text belongs.",
      idea:
        "Check the reply before you use it. Zod describes the shape you expect and tests every reply against it. A mismatch gives you a precise error instead of a silent bug.",
      diagram:
        "Gemini text ──▶ JSON.parse ──▶ Zod check ──✓──▶ your app uses it\n                                   └──✗──▶ retry once with the error, then fail clearly",
      action:
        "Describe the expected shape with Zod, and check Gemini's reply against it before returning it.",
      result: "The same answer, but now your app has checked it first.",
      personalize: (mvp) => ({
        action: `Describe the shape ${mvp.name} expects with Zod, and check every reply against it:`,
        code: `const Reply = ${mvp.schemaCode};\nconst result = Reply.safeParse(JSON.parse(text));`,
        result: mvp.validationNote,
      }),
      why: "TypeScript's type checks disappear once the code is running. Zod's check keeps working in production. Good AI products never hand unchecked model output to a user.",
      snag: "A common first version retries on any error. Retry only when the reply has the wrong shape, and send the error back to the model. A blind retry just rolls the dice again, and a wrong key fails twice.",
    },
    {
      title: "Save your work",
      concept: "Git · GitHub",
      problem:
        "One bad edit can break everything, and right now your code only exists on one laptop.",
      idea:
        "Git saves snapshots of your project, called commits. GitHub stores them online.",
      action: "Create an empty repository on GitHub and connect it to your folder. Then:",
      code: 'git add .\ngit commit -m "First AI route"\ngit push',
      result: "Your files on github.com — with no .env.local among them.",
      why: "Your commit history is also a record of how you built it. That's useful in an interview.",
      snag: "Commit package.json and package-lock.json along with your code. They tell other computers which packages to install; leave them out and the deploy fails. On Windows, \"LF will be replaced by CRLF\" warnings are harmless.",
    },
    {
      title: "Put it online",
      concept: "Deployment · Vercel",
      problem: "localhost only works on your own computer.",
      idea:
        "Vercel builds your app from GitHub and hosts it. Every push to GitHub triggers a new build.",
      diagram: "git push ──▶ GitHub ──▶ Vercel builds ──▶ live URL",
      action:
        "Import your GitHub repository into Vercel. Add GEMINI_API_KEY under Settings → Environment Variables as a Secret. Then push a commit.",
      result: "https://your-app.vercel.app/api/ask-ai returns a JSON answer.",
      why: "A link anyone can open. That's a shipped AI app.",
      snag: "Add the key before you push: environment variables only apply to builds started after you add them. Vercel's Redeploy button rebuilds the old commit, so new code only goes live when you push it. Run npm run build on your own computer first; it's the same build Vercel runs.",
    },
    {
      title: "Give it a face",
      concept: "Your app's screen",
      problem:
        "Your route returns JSON. Nobody wants to read JSON. Right now you have plumbing, not a product.",
      idea:
        "Add a page with a box to paste text and a button. The page hands the text to your own route and shows the answer the way a person wants to read it. You can do this with no JavaScript in the browser: the form puts the text in the address bar, and the server does the rest. That is the same trick this lab uses.",
      diagram:
        "person types ──▶ your page ──▶ your route ──▶ Gemini\n             ◀── a readable result ◀──",
      action:
        "Replace the starter home page with a form and a result area. The shape is short:",
      code:
        "// app/page.tsx — your app's screen\nexport default async function Page({ searchParams }) {\n  const { text } = await searchParams;\n  const result = text ? await askGemini(text) : null;\n\n  return (\n    <form>\n      <textarea name=\"text\" defaultValue={text} />\n      <button>Run</button>\n      {result && <Result data={result} />}\n    </form>\n  );\n}",
      result:
        "A screen you would be happy to show someone: paste text, press Run, read the answer.",
      why: "This is where it stops being a demo and becomes a tool someone can use. Everything before this step was plumbing.",
      snag:
        "Your page is public, so every visitor spends your free quota. Before sharing it widely, add a limit or keep the link to people you trust.",
      personalize: (mvp) => ({
        action: `Build the screen for ${mvp.name}: a box to paste ${mvp.input}, a Run button, and the result shown as ${mvp.resultShownAs}. The shape is short:`,
        result: `The screen pictured above the steps, working for real: paste ${mvp.input}, press Run, and ${mvp.audience} gets ${mvp.resultShownAs}.`,
      }),
    },
  ],
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
