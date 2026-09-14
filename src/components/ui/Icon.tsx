import type { SVGProps } from "react";

export type IconName =
  | "sparkles"
  | "home"
  | "chart"
  | "shield"
  | "check"
  | "arrow"
  | "heart"
  | "puzzle"
  | "users"
  | "star"
  | "phone"
  | "pin"
  | "clock"
  | "brain"
  | "sprout"
  | "handHeart"
  | "medal"
  | "chat"
  | "target"
  | "image"
  | "play"
  | "child"
  | "childHeart"
  | "adult";

const paths: Record<IconName, React.ReactNode> = {
  sparkles: (
    <path d="M12 3l1.9 4.8L18.8 9.7 14 11.6 12 16.4l-2-4.8L5.2 9.7 10 7.8 12 3zM18 15l.9 2.3 2.3.9-2.3.9L18 21.4l-.9-2.3-2.3-.9 2.3-.9L18 15z" />
  ),
  home: (
    <path d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  chart: (
    <path d="M5 20V10M12 20V4M19 20v-7" strokeWidth={2.4} fill="none" strokeLinecap="round" />
  ),
  shield: (
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  check: (
    <path d="M5 12l4.5 4.5L19 7" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrow: (
    <path d="M5 12h14M13 6l6 6-6 6" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  heart: (
    <path d="M12 20s-7-4.3-9.3-8.5C1.2 8.6 2.8 5.5 6 5.5c1.9 0 3.2 1.1 4 2.3.8-1.2 2.1-2.3 4-2.3 3.2 0 4.8 3.1 3.3 6C19 15.7 12 20 12 20z" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  puzzle: (
    <path d="M10 4a2 2 0 0 1 4 0v1h4v4a2 2 0 1 1 0 4v4h-4v-1a2 2 0 1 0-4 0v1H6v-4a2 2 0 1 1 0-4V5h4V4z" strokeWidth={2} fill="none" strokeLinejoin="round" />
  ),
  users: (
    <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 6.5a3 3 0 0 1 0 5.8M17 14.5a6 6 0 0 1 4 5.5" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  star: (
    <path d="M12 3l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 17.6 6.2 20.6l1.6-6.5-5.1-4.4 6.7-.5L12 3z" strokeWidth={2} fill="none" strokeLinejoin="round" />
  ),
  phone: (
    <path d="M6 3h3l1.5 5-2 1.5a12 12 0 0 0 6 6l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  pin: (
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  clock: (
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  brain: (
    <path d="M9 4.5A2.5 2.5 0 0 0 6.5 7 2.5 2.5 0 0 0 5 9.3 2.6 2.6 0 0 0 5 14a2.6 2.6 0 0 0 1.6 2.4A2.5 2.5 0 0 0 9 19.5c1 0 1.8-.5 1.8-1.3V6c0-.9-.8-1.5-1.8-1.5zM15 4.5A2.5 2.5 0 0 1 17.5 7 2.5 2.5 0 0 1 19 9.3 2.6 2.6 0 0 1 19 14a2.6 2.6 0 0 1-1.6 2.4A2.5 2.5 0 0 1 15 19.5c-1 0-1.8-.5-1.8-1.3V6c0-.9.8-1.5 1.8-1.5z" strokeWidth={1.7} fill="none" strokeLinejoin="round" />
  ),
  sprout: (
    <path d="M12 20v-7m0 0c0-3 2.5-5 6-5 0 3-2.5 5-6 5zm0 0C12 10 9.5 8 6 8c0 3 2.5 5 6 5z" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  handHeart: (
    <path d="M4 21v-7M4 15l4-1 5 1c1.2.2 1.2 2-.3 2H9m8-8.5c0-1.4-2-2.4-3-.8-1-1.6-3-.6-3 .8 0 1.5 3 3.2 3 3.2s3-1.7 3-3.2zM4 21l6 .0 6-1.6 4-3.4c1-1-.4-2.4-1.6-1.6L14 17" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  medal: (
    <path d="M8 3l2 6M16 3l-2 6M12 22a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm0-3.2 2 1.2-.5-2.3 1.7-1.5-2.3-.2L12 14l-.9 2-2.3.2 1.7 1.5-.5 2.3z" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  chat: (
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6z" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  target: (
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-3.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" strokeWidth={2} fill="none" strokeLinejoin="round" />
  ),
  image: (
    <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM3.5 17l5-5 4 4 3-3 5 5" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  play: (
    <path d="M8 5.5v13l11-6.5-11-6.5z" strokeWidth={2} fill="currentColor" strokeLinejoin="round" />
  ),
  child: (
    <>
      <circle cx="12" cy="7" r="3.1" strokeWidth={2} />
      <path d="M6.8 20v-2.2a5.2 5.2 0 0 1 10.4 0V20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  childHeart: (
    <>
      <circle cx="9.5" cy="8" r="2.8" strokeWidth={2} />
      <path d="M5 20v-2a4.6 4.6 0 0 1 9 0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 3.4c-.9-1-2.6-.4-2.6.9 0 1 1.5 2 2.6 2.7 1.1-.7 2.6-1.7 2.6-2.7 0-1.3-1.7-1.9-2.6-.9z" strokeWidth={1.7} strokeLinejoin="round" />
    </>
  ),
  adult: (
    <>
      <circle cx="12" cy="6" r="2.7" strokeWidth={2} />
      <path d="M5.8 20v-2.8a6.2 6.2 0 0 1 12.4 0V20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

/** Íconos de línea (fill/stroke usan currentColor). */
export function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  const filled = name === "sparkles" || name === "play";
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
