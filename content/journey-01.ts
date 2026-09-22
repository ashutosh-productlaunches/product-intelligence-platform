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
    "A live website that gets an answer from an AI model",
    "Your API key kept safely off the internet",
    "Code you can explain line by line",
  ],
  steps: [
    {
      title: "Ask Gemini something",
      concept: "API",
      problem:
        "You want your app to get an answer from Gemini. But Gemini runs on Google's computers, not yours. How do two programs on different machines talk?",
      idea:
        "Through an API: a door Google publishes, with rules. Send a request in this format, get a response in that format. Your app never sees inside Gemini. It only knows the door.",
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
      why: "localhost means \"this computer\". Nobody else can see it yet. That comes in step 9.",
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
      snag: "\"Don't share your key\" means don't paste it into a chat, a message or a code file. Storing it in your own server's settings later (step 9) is not sharing it.",
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
  ],
  next: {
    title: "Journey 2 · When should the model not decide?",
    teaser:
      "Some decisions need an AI model. Many don't. You'll build a tool that scores a task with an LLM, then lets plain code make the call.",
  },
};
