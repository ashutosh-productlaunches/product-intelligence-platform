// Small line icons for the five tools. Inline SVG: no icon library, no extra download.
const common = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ToolIcon({ id }: { id: string }) {
  switch (id) {
    case "summarise":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 11h11M4 16h13M4 21h7" />
        </svg>
      );
    case "classify":
      return (
        <svg {...common}>
          <path d="M20.6 13.6 13.6 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8Z" />
          <circle cx="7.5" cy="7.5" r="1.2" />
        </svg>
      );
    case "extract":
      return (
        <svg {...common}>
          <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2" />
          <path d="M9 9h6M9 13h6M9 17h3" />
        </svg>
      );
    case "rewrite":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.5.2-.7.6-.7 1.1v.5" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}
