// The three looks a learner can give their app in step 12 — and the look of /demo.
//
// One source for both: /demo takes its colours from the "transmutation" look below,
// and step 12 prints the same values as a CSS file the learner pastes in.
// Change a value here and both change together.
//
// A look is a handful of design tokens: named values (colours, fonts, corner radius)
// that every rule in the stylesheet uses instead of raw values.

export type Look = {
  id: "transmutation" | "blueprint" | "floor";
  name: string;
  mood: string; // one line: what it feels like
  tokens: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accent2: string;
    border: string;
    radius: string;
  };
  fonts: {
    display: string; // headings
    body: string; // everything else
    displayWeight: number;
    displayTracking: string; // letter spacing on headings
    googleFonts: string; // the family= part of a Google Fonts link
  };
  // Anything extra this look adds to the page background.
  backdrop: string;
};

export const looks: Look[] = [
  {
    id: "transmutation",
    name: "Transmutation",
    mood: "Night sky and glowing light. The look of the live demo.",
    tokens: {
      bg: "#05060f",
      surface: "#0f1124",
      text: "#ece9ff",
      muted: "#a39fc7",
      accent: "#62e3ff",
      accent2: "#9b7bff",
      border: "rgba(190, 180, 255, 0.16)",
      radius: "14px",
    },
    fonts: {
      display: "Josefin Sans",
      body: "Instrument Sans",
      displayWeight: 200,
      displayTracking: "0.05em",
      googleFonts: "family=Josefin+Sans:wght@200;400&family=Instrument+Sans:wght@400;600",
    },
    backdrop:
      "radial-gradient(60rem 30rem at 50% -10%, rgba(155, 123, 255, 0.22), transparent 70%), radial-gradient(40rem 24rem at 90% 10%, rgba(98, 227, 255, 0.10), transparent 70%)",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    mood: "Light, precise and calm, like an engineering drawing.",
    tokens: {
      bg: "#eef3f8",
      surface: "#ffffff",
      text: "#0e2238",
      muted: "#4c6278",
      accent: "#1f5fbf",
      accent2: "#0e7d71",
      border: "#c9d6e3",
      radius: "6px",
    },
    fonts: {
      display: "IBM Plex Sans Condensed",
      body: "IBM Plex Sans",
      displayWeight: 600,
      displayTracking: "0",
      googleFonts: "family=IBM+Plex+Sans+Condensed:wght@600&family=IBM+Plex+Sans:wght@400;600",
    },
    backdrop:
      "linear-gradient(rgba(31, 95, 191, 0.06) 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, rgba(31, 95, 191, 0.06) 1px, transparent 1px) 0 0 / 24px 24px",
  },
  {
    id: "floor",
    name: "Warehouse floor",
    mood: "Bold and high-visibility, like safety markings on a dark floor.",
    tokens: {
      bg: "#141414",
      surface: "#1f1f1f",
      text: "#f2f2ef",
      muted: "#a3a39c",
      accent: "#ffb81c",
      accent2: "#ff7a2f",
      border: "#3a3a36",
      radius: "2px",
    },
    fonts: {
      display: "Archivo Narrow",
      body: "Archivo",
      displayWeight: 700,
      displayTracking: "0.01em",
      googleFonts: "family=Archivo+Narrow:wght@700&family=Archivo:wght@400;600",
    },
    backdrop:
      "repeating-linear-gradient(-45deg, rgba(255, 184, 28, 0.9) 0 14px, transparent 14px 28px) top / 100% 8px no-repeat",
  },
];

export const getLook = (id: Look["id"]) => looks.find((l) => l.id === id)!;

// The file a learner pastes over app/globals.css in step 12.
// Plain CSS that styles the plain HTML elements their page already uses
// (main, h1, form, textarea, button, ol, li, p), so page.tsx does not change.
export function lookCss(look: Look): string {
  const t = look.tokens;
  const f = look.fonts;
  return `/* app/globals.css — the "${look.name}" look */
/* Fonts come first: CSS only accepts @import lines at the very top. */
@import url("https://fonts.googleapis.com/css2?${f.googleFonts}&display=swap");
@import "tailwindcss";

/* The tokens. Change these values and the whole page follows. */
:root {
  --bg: ${t.bg};
  --surface: ${t.surface};
  --text: ${t.text};
  --muted: ${t.muted};
  --accent: ${t.accent};
  --accent-2: ${t.accent2};
  --border: ${t.border};
  --radius: ${t.radius};
  --font-display: "${f.display}", system-ui, sans-serif;
  --font-body: "${f.body}", system-ui, sans-serif;
}

/* The rules. Each one uses tokens, never raw colours. */
body {
  min-height: 100vh;
  background: ${look.backdrop}, var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.6;
}

h1 {
  font-family: var(--font-display);
  font-weight: ${f.displayWeight};
  letter-spacing: ${f.displayTracking};
  font-size: clamp(2rem, 6vw, 3.25rem);
  line-height: 1.05;
  margin: 0 0 1.5rem;
}

form {
  display: grid;
  gap: 0.75rem;
}

textarea {
  width: 100%;
  padding: 1rem;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: inherit;
}

textarea:focus,
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

button {
  justify-self: start;
  padding: 0.7rem 1.6rem;
  background: var(--accent);
  color: var(--bg);
  border: 0;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: var(--accent-2);
}

ol,
ul,
dl {
  display: grid;
  gap: 0.6rem;
  margin-top: 1.5rem;
  padding: 1.25rem 1.25rem 1.25rem 2.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  list-style: decimal;
}

li::marker {
  color: var(--accent);
}

p {
  color: var(--muted);
}
`;
}
