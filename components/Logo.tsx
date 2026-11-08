// Original Ironline mark: a ring (wheel) with a stylised "I" rivet-bar monogram, plus wordmark.
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="var(--ink)" />
      <circle cx="32" cy="32" r="21" fill="none" stroke="var(--brass)" strokeWidth="4" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <circle key={i} cx={32 + Math.cos(a) * 25.5} cy={32 + Math.sin(a) * 25.5} r="1.6" fill="var(--brass)" />;
      })}
      <path d="M24 18h16M32 18v28M24 46h16" stroke="var(--paper)" strokeWidth="5" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo-lockup">
      <LogoMark />
      <span className="wordmark"><b>IRONLINE</b><small>MOTOR CO. · EST. 1987</small></span>
    </span>
  );
}
