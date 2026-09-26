// "Check your understanding": five questions after each Journey 1 step.
// checks01[0] belongs to step 1, checks01[1] to step 2, and so on.
//
// Each answer carries its own explanation: why it's right, or why it's wrong.
// Exactly one answer per question is correct. Questions test understanding
// (scenarios, cause and effect), not recall of names.

export type Answer = { text: string; why: string; correct?: true };
export type Question = { q: string; answers: Answer[] };

const ok = (text: string, why: string): Answer => ({ text, why, correct: true });
const no = (text: string, why: string): Answer => ({ text, why });

export const checks01: Question[][] = [
  // 1 · Start with the end
  [
    {
      q: "In the demo, which part holds the Gemini API key?",
      answers: [
        no("The page in the browser", "Anything sent to the browser can be read by the person using it. A key there would leak."),
        ok("The server", "Only server code can read the key. The browser gets answers, never the key."),
        no("The AI model", "Google issues the key, but your app has to send it with each request. It's stored on your server."),
      ],
    },
    {
      q: "You paste text and press Run. What's the order of the trip?",
      answers: [
        no("Page → model → server", "The page never talks to the model directly. That would need the key in the browser."),
        ok("Page → server → model → server → page", "The server sits in the middle both ways: it sends the request and checks the reply before the page shows it."),
        no("Server → page → model", "The trip starts where the person acts: the page."),
      ],
    },
    {
      q: "The demo feels slow. Which box is the most likely cause?",
      answers: [
        ok("The model call", "Generating a reply usually takes seconds. The page and server work takes milliseconds."),
        no("Drawing the page", "Rendering takes milliseconds. It's rarely the bottleneck in an AI app."),
        no("The server checking the answer", "A schema check is plain code and runs in a few milliseconds."),
      ],
    },
    {
      q: "Why doesn't the page call the model directly?",
      answers: [
        no("The model only accepts requests from servers", "The API would accept a request from anywhere with a valid key. The problem is where the key would have to be."),
        ok("The key would be visible to anyone using the page", "That's the whole reason for the server in the middle."),
        no("Browsers can't make internet requests", "They can, all the time. That isn't the reason."),
      ],
    },
    {
      q: "Of the three boxes, which do you actually build?",
      answers: [
        no("The model", "The model is rented from a provider. You call it; you don't build it."),
        no("Only the page", "The server is yours too. It's where your logic and your key live."),
        ok("The page and the server", "Those two are your application. The model is a service your server calls."),
      ],
    },
  ],

  // 2 · Choose a model to talk to
  [
    {
      q: "What does an LLM do with your prompt?",
      answers: [
        no("Looks up the answer in a database", "There's no lookup. The model generates a reply."),
        ok("Predicts a likely continuation, one piece at a time", "That's why answers are fluent, and also why they can be confidently wrong."),
        no("Runs code you wrote", "Your code calls the model. The model doesn't run your code."),
      ],
    },
    {
      q: "Where does Gemini run when your app calls it?",
      answers: [
        ok("On Google's servers", "Your app sends a request over the internet and waits for the reply."),
        no("On your laptop", "Nothing about the model is installed on your computer."),
        no("In the visitor's browser", "The browser never talks to Gemini in this app."),
      ],
    },
    {
      q: "What is an API, in one line?",
      answers: [
        no("A kind of AI model", "The API is the door. The model sits behind it."),
        no("A website for people", "AI Studio is a website for people. The API is for programs."),
        ok("A contract for how one program asks another for something", "Send a request in the agreed format, get a response in the agreed format."),
      ],
    },
    {
      q: "Finance asks you to switch from Gemini to OpenAI. What changes most?",
      answers: [
        ok("The model call and the API key", "Steps 5 and 7. The page, the server route and the validation stay the same."),
        no("The whole architecture", "Page → server → model is the same shape for every provider."),
        no("The page's design", "The screen doesn't know or care which model answered."),
      ],
    },
    {
      q: "Pressing Run in AI Studio is closest to which thing your app will do?",
      answers: [
        no("Training the model", "You use the model; you never train it here."),
        ok("Sending an API request to Gemini", "AI Studio sends the request for you. Your app will send the same kind of request."),
        no("Downloading the model", "The model never leaves Google's servers."),
      ],
    },
  ],

  // 3 · Get a place to run code
  [
    {
      q: "What is Node.js for in this project?",
      answers: [
        ok("Running JavaScript outside the browser", "Your server and your development tools are JavaScript, and Node runs them."),
        no("Writing code", "That's VS Code, the editor."),
        no("Saving versions of your work", "That's Git."),
      ],
    },
    {
      q: "What does npm do?",
      answers: [
        no("Uploads your code to GitHub", "That's git push."),
        ok("Downloads packages of code other people wrote", "Next.js, the Gemini library and Zod all arrive through npm."),
        no("Shows your page in the browser", "The browser shows the page. npm installs and runs tools."),
      ],
    },
    {
      q: "Straight after installing, node -v says 'not recognised'. Most likely cause?",
      answers: [
        no("Your computer is too old", "Node runs on almost any modern computer."),
        no("Node always fails to install the first time", "It usually installs fine. The terminal just doesn't know yet."),
        ok("The terminal was open before you installed", "It only looks for programs when it starts. Restart VS Code."),
      ],
    },
    {
      q: "An engineer says 'it works on my machine'. What is most likely different?",
      answers: [
        ok("The runtime and tool versions on each computer", "Same code, different Node or package versions, different behaviour."),
        no("The AI model", "Everyone calls the same model through the same API."),
        no("The code on GitHub", "Both people pulled the same code. The environment is what differs."),
      ],
    },
    {
      q: "What is the terminal?",
      answers: [
        no("A programming language", "It's where you type commands, in whatever language the tool expects."),
        ok("A place to give your computer commands by typing instead of clicking", "Every tool in this journey is started from it."),
        no("A server on the internet", "It runs commands on your own computer."),
      ],
    },
  ],

  // 4 · Create the app
  [
    {
      q: "What does Next.js give you?",
      answers: [
        ok("A structure for a web app: pages for visitors and server routes for private work", "That split is exactly what an AI app needs."),
        no("An AI model", "Next.js has no model in it. You call one through an API."),
        no("Hosting on the internet", "That's Vercel, in step 10."),
      ],
    },
    {
      q: "What is package.json?",
      answers: [
        no("Where your API key lives", "Never. The key lives in .env.local, which isn't uploaded."),
        ok("The list of packages your app depends on, plus scripts such as dev", "It's how any computer, including Vercel's, knows what to install."),
        no("Your home page", "That's app/page.tsx."),
      ],
    },
    {
      q: "You open localhost:3000. Who can see it?",
      answers: [
        no("Anyone with the link", "localhost means 'this computer'. Nobody else can reach it."),
        no("Your team, through GitHub", "GitHub stores code; it doesn't run your app."),
        ok("Only you, on this computer", "That changes in step 10, when Vercel puts it online."),
      ],
    },
    {
      q: "npm run dev says 'Missing script: dev'. Most likely cause?",
      answers: [
        ok("The terminal isn't inside the project folder", "npm looks for package.json where you are. Run cd my-ai-app first."),
        no("Next.js didn't install", "That would fail differently. This message means npm found no dev script where it looked."),
        no("Port 3000 is busy", "That gives a different message, and Next.js simply picks another port."),
      ],
    },
    {
      q: "Why does the choice of framework matter to a PM?",
      answers: [
        no("It decides which AI model you can use", "Any framework can call any model's API."),
        ok("It's hard to reverse, and it shapes where code runs and who you can hire", "It's an architecture decision with long-term cost."),
        no("It only affects colours and fonts", "Styling is a small part. The framework decides the app's structure."),
      ],
    },
  ],

  // 5 · Prove it's you
  [
    {
      q: "Why put the key in .env.local instead of in your code?",
      answers: [
        ok("So the code can be shared or published without the key", "The secret stays on your computer; the code can go anywhere."),
        no("Gemini refuses keys written in code", "It would work. The key would just leak with the code."),
        no("It makes the app faster", "Speed is identical. This is about security."),
      ],
    },
    {
      q: "What stops .env.local from reaching GitHub?",
      answers: [
        no("Vercel", "Vercel never sees your laptop's files."),
        ok("The .env* line in .gitignore", "Git skips any file that matches. That's why you checked it."),
        no("Nothing, so you delete it before every push", "No need: .gitignore does it every time."),
      ],
    },
    {
      q: "You created the key file while the dev server was running. In step 7 Gemini says the key is missing. What's the fix?",
      answers: [
        no("Create a new key", "The key is fine. The server just hasn't read the file."),
        no("Paste the key into page.tsx", "That would expose it, and wouldn't fix the real cause."),
        ok("Restart the dev server", ".env.local is only read at startup."),
      ],
    },
    {
      q: "What is an environment variable?",
      answers: [
        ok("A setting the app reads when it starts, kept outside the code", "Same code, different settings on your laptop and on Vercel."),
        no("A value that changes every time the page loads", "It's fixed while the app runs."),
        no("A browser setting", "It lives with the server, never in the browser."),
      ],
    },
    {
      q: "A new feature needs a third-party service. What's the first security question?",
      answers: [
        no("How many users will use it?", "Useful for cost, but not the first security question."),
        ok("Where will its key live, and who can see it?", "Every new service brings a secret that has to be kept on the server."),
        no("Which button colour to use?", "Not a security question."),
      ],
    },
  ],

  // 6 · Keep the key off the browser
  [
    {
      q: "What is a server route?",
      answers: [
        no("A link in the browser's address bar", "The address triggers the route. The route is the code that answers."),
        ok("Code that runs on the server when someone requests an address", "The browser gets the response, never the code."),
        no("A page layout", "Layouts are for pages people see. A route returns data."),
      ],
    },
    {
      q: "You open /api/ask-ai and see {\"ok\":true}. What did the browser receive?",
      answers: [
        ok("Only the response", "The code and anything it can read, like your key, stay on the server."),
        no("The code in route.ts", "Server code never leaves the server."),
        no("The API key", "The route doesn't send it, and the browser can't read server variables."),
      ],
    },
    {
      q: "You get a 404 at /api/ask-ai. Most likely cause?",
      answers: [
        no("The API key is wrong", "The route doesn't use the key yet."),
        no("Gemini is down", "The route doesn't call Gemini yet."),
        ok("The file isn't at app/api/ask-ai/route.ts", "The folder path is the address. One wrong letter gives a 404."),
      ],
    },
    {
      q: "Why build the empty route before adding the AI?",
      answers: [
        ok("So any later failure can be narrowed to the model call", "Test one layer at a time, and you know where a problem lives."),
        no("Next.js requires an empty route first", "It doesn't. This is a debugging habit."),
        no("It deploys faster", "Deploy speed is the same."),
      ],
    },
    {
      q: "Someone names the key NEXT_PUBLIC_GEMINI_API_KEY. What's the problem?",
      answers: [
        no("None, it's just a longer name", "The prefix isn't cosmetic."),
        ok("That prefix tells Next.js to send the value to the browser", "The key would leak to every visitor."),
        no("Names can't contain underscores", "They can. The prefix is the problem."),
      ],
    },
  ],

  // 7 · Ask the model
  [
    {
      q: "Why ask the model for JSON?",
      answers: [
        ok("So your code can reliably find a specific field", "Code needs data in a known place, not prose."),
        no("JSON answers are more accurate", "The format doesn't make the content truer."),
        no("Gemini can only reply in JSON", "It replies in prose unless you ask otherwise."),
      ],
    },
    {
      q: "What does temperature: 0 do?",
      answers: [
        no("Makes the model faster", "Speed barely changes."),
        no("Guarantees a correct answer", "Nothing guarantees correctness. That's why step 8 exists."),
        ok("Reduces randomness, so the same input gives more similar answers", "Useful when code depends on the output."),
      ],
    },
    {
      q: "What does JSON.parse do?",
      answers: [
        ok("Turns JSON text into data your code can use", "It changes the format, not the truth. It doesn't check the content."),
        no("Checks that the answer is correct", "That's validation, in step 8."),
        no("Sends the prompt to Gemini", "generateContent does that."),
      ],
    },
    {
      q: "The route fails with 'API key not valid'. Where do you look first?",
      answers: [
        no("GitHub", "The key isn't there, and shouldn't be."),
        ok("The terminal running npm run dev", "Server errors print there; the browser often shows only a generic error."),
        no("The browser's page", "It rarely shows the real server error."),
      ],
    },
    {
      q: "Your product routes support tickets using the AI's label. Why does structured output matter?",
      answers: [
        no("It makes each ticket cheaper", "Cost is about the same."),
        no("It doesn't, free text works fine", "Code can't reliably find a label inside a paragraph."),
        ok("Routing logic needs the label in a predictable place", "AI output becomes product input, so its shape must be dependable."),
      ],
    },
  ],

  // 8 · Don't trust it blindly
  [
    {
      q: "You asked for JSON. Why check it anyway?",
      answers: [
        ok("Asking isn't a guarantee: fields can go missing or have the wrong type", "Models are probabilistic. Most replies are fine; some aren't."),
        no("To make the reply shorter", "Validation doesn't change the reply."),
        no("TypeScript already checks it while the app runs", "TypeScript's types disappear when the code runs. Zod's check doesn't."),
      ],
    },
    {
      q: "What does safeParse return when the reply has the wrong shape?",
      answers: [
        no("A corrected answer", "It reports the problem; it doesn't fix it."),
        ok("A description of what's wrong, without crashing", "Your code can then decide to retry or fail honestly."),
        no("It crashes the app", "That's what the unsafe version does. safeParse never throws."),
      ],
    },
    {
      q: "The first reply fails the check. What does the app do?",
      answers: [
        no("Shows it anyway", "That's exactly what validation prevents."),
        no("Retries until it works", "Unlimited retries cost money and can loop forever."),
        ok("Retries once, telling the model what was wrong", "Then, if it fails again, it says so plainly."),
      ],
    },
    {
      q: "Every single run fails the check. Most likely cause?",
      answers: [
        ok("The prompt and the schema disagree", "For example, the prompt asks for five points and the schema expects three."),
        no("Gemini is broken", "An occasional failure is normal. Every run failing points at your setup."),
        no("The API key expired", "A key problem fails before any reply arrives."),
      ],
    },
    {
      q: "Which decision here belongs to the product manager?",
      answers: [
        no("Which validation library to use", "That's an engineering choice."),
        ok("What the product does when the AI fails: retry, fall back or tell the user", "Failure behaviour is part of the user experience."),
        no("None, validation is purely technical", "How failure feels to users is a product decision."),
      ],
    },
  ],

  // 9 · Save your work
  [
    {
      q: "What is a commit?",
      answers: [
        ok("A saved snapshot of your files, on your computer", "You can compare snapshots or go back to one."),
        no("An upload to GitHub", "That's push."),
        no("A deployment", "Deploying happens on Vercel, after a push."),
      ],
    },
    {
      q: "What's the right order?",
      answers: [
        no("push → commit → add", "You can't push what isn't committed."),
        ok("add → commit → push", "Choose files, snapshot them, then copy the snapshot to GitHub."),
        no("commit → add → push", "add chooses what goes into the commit, so it comes first."),
      ],
    },
    {
      q: "Why push to GitHub at all?",
      answers: [
        no("Your code won't run locally without it", "It runs fine on your laptop without GitHub."),
        no("It makes the code faster", "It doesn't change the code."),
        ok("Your work survives your laptop, and others, including Vercel, can read it", "GitHub is the shared, off-laptop copy."),
      ],
    },
    {
      q: "git commit says 'Author identity unknown'. What does it mean?",
      answers: [
        ok("Git doesn't know your name and email yet", "Run the two git config lines once, then commit again."),
        no("GitHub rejected your password", "Nothing has reached GitHub yet. This is Git on your computer."),
        no("The repository doesn't exist", "The commit is local; GitHub isn't involved yet."),
      ],
    },
    {
      q: "A bug appeared this week. Which question does Git let you answer?",
      answers: [
        no("Which user caused it?", "Git records who changed the code, not who used the app."),
        ok("Which commit introduced it?", "You can compare versions, find the change and roll it back."),
        no("Which model version failed?", "Git tracks your code, not the provider's model."),
      ],
    },
  ],

  // 10 · Put it online
  [
    {
      q: "What does Vercel do after each push?",
      answers: [
        ok("Installs packages, builds the app and serves the new version", "If the build succeeds, the new version goes live."),
        no("Only copies your files", "It runs npm install and npm run build first."),
        no("Retrains the model", "Vercel hosts your app; it has nothing to do with the model."),
      ],
    },
    {
      q: "On Vercel, what does the job of .env.local?",
      answers: [
        no(".env.local, uploaded from GitHub", "It's never on GitHub. That's the point."),
        ok("The environment variable you set in the project's settings", "Same variable name, different place, same secret."),
        no("Nothing, because a live app doesn't need a key", "Every call to Gemini needs the key, live or local."),
      ],
    },
    {
      q: "The build fails on Vercel. What's the best first move?",
      answers: [
        ok("Run npm run build on your computer and read the first error", "It's the same build, and errors are easier to read locally."),
        no("Press Redeploy until it works", "Redeploy rebuilds the same commit and fails the same way."),
        no("Delete the project and start again", "The code is the problem, not the project."),
      ],
    },
    {
      q: "You added GEMINI_API_KEY after deploying, and the AI still fails. Why?",
      answers: [
        no("The key has to be in the code", "Never. It belongs in environment variables."),
        no("Vercel blocks AI APIs", "It doesn't."),
        ok("Environment variables only apply to builds started after you add them", "Push a new commit to build with the key."),
      ],
    },
    {
      q: "Why does deployment matter to a PM?",
      answers: [
        no("It improves the AI's answers", "The answers are the same, local or live."),
        ok("A prototype isn't a product until people can reach it reliably", "Deployment is where releases and rollbacks happen."),
        no("It's only an engineering concern", "Whether users can reach the product is everyone's concern."),
      ],
    },
  ],

  // 11 · Give it a face
  [
    {
      q: "Where does app/page.tsx run?",
      answers: [
        ok("On the server, which sends finished HTML to the browser", "That's why it can call askGemini directly without exposing the key."),
        no("Only in the browser", "It's a server component; the browser just receives the result."),
        no("On Gemini's servers", "Gemini only answers the model call."),
      ],
    },
    {
      q: "What happens when someone presses Run?",
      answers: [
        no("The browser calls Gemini directly", "The browser only reloads the page. The server calls Gemini."),
        ok("The page reloads with the text in the address, and the server calls the model", "The form puts ?text=… in the URL; the server reads it."),
        no("The text is saved to a database", "There's no database in this app."),
      ],
    },
    {
      q: "You press Run, nothing appears, and there's no error. Most likely cause?",
      answers: [
        no("The browser is too old", "The page is plain HTML. Any browser shows it."),
        ok("lib/ask.ts is still the step 7 version", "The page expects ok and data from the step 8 version."),
        no("Vercel is down", "You're testing on localhost, so Vercel isn't involved."),
      ],
    },
    {
      q: "Your page is public. What's the product risk?",
      answers: [
        ok("Every visitor spends your free quota", "Until you add limits, share the link carefully."),
        no("Visitors can read your key", "The key stays on the server."),
        no("There's no risk", "Unlimited public use of a paid resource is a real risk."),
      ],
    },
    {
      q: "Which of these is a product decision rather than a model decision?",
      answers: [
        no("What data the model was trained on", "You don't control that."),
        no("Which computers the model runs on", "The provider decides that."),
        ok("How an error message is worded", "What people see when things fail decides whether they trust the product."),
      ],
    },
  ],

  // 12 · Make it look like yours
  [
    {
      q: "What is a design token?",
      answers: [
        ok("A named value, such as a colour or font, defined once and reused", "Change the value and every place using it follows."),
        no("A login credential", "Same word, different meaning."),
        no("A unit of text the AI reads", "That's an LLM token. Same word again, different meaning."),
      ],
    },
    {
      q: "You change --accent and save. What happens?",
      answers: [
        no("Only the first button changes", "Every rule using var(--accent) changes."),
        ok("Everything that uses var(--accent) changes", "That's the point of a token."),
        no("Nothing, until you edit page.tsx", "The page doesn't change; the stylesheet does all the work."),
      ],
    },
    {
      q: "Why didn't page.tsx need to change?",
      answers: [
        ok("The CSS styles plain elements the page already uses", "main, h1, textarea and button are styled wherever they appear."),
        no("Next.js ignores page.tsx", "It's the page itself; it isn't ignored."),
        no("The look comes from the AI's reply", "The model has nothing to do with styling."),
      ],
    },
    {
      q: "After pasting a look, the font is plain. Most likely cause?",
      answers: [
        no("Custom fonts need a paid plan", "Google Fonts are free."),
        ok("The @import lines aren't at the top of the file", "CSS ignores an @import that comes after any other rule."),
        no("Gemini changed the font", "The model doesn't touch your styles."),
      ],
    },
    {
      q: "Why do design tokens matter to a PM?",
      answers: [
        no("They make the AI's answers better", "They only affect how the page looks."),
        no("They only matter to designers", "They decide how fast brand and UI changes can ship."),
        ok("A rebrand becomes a change of values in one place", "That's the difference between a day and a quarter."),
      ],
    },
  ],
];
