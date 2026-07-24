// Inline SVG "3D-style" scenes for the Arya Premium onboarding.
// No raster images — pure gradients + shadows for a stylized 3D feel.

const BRAND = {
  purple: "#B600A8",
  violet: "#7621B0",
  amber: "#BE4C00",
  ink: "#0C0C0C",
  paper: "#D7E2EA",
};

function SceneFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 340 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <defs>
        <radialGradient id="bg" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor={BRAND.violet} stopOpacity="0.35" />
          <stop offset="60%" stopColor={BRAND.ink} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18011F" />
          <stop offset="40%" stopColor={BRAND.purple} />
          <stop offset="75%" stopColor={BRAND.violet} />
          <stop offset="100%" stopColor={BRAND.amber} />
        </linearGradient>
        <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5F1FA" />
          <stop offset="50%" stopColor="#C8B7D9" />
          <stop offset="100%" stopColor="#5E4577" />
        </linearGradient>
        <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>
      <rect x="0" y="0" width="340" height="340" fill="url(#bg)" />
      {children}
    </svg>
  );
}

/** Welcome — a 3D user avatar surrounded by genre orbs */
export function WelcomeScene() {
  const genres: { c: string; e: string; x: number; y: number; r: number }[] = [
    { c: "#FF3D68", e: "🎭", x: 60, y: 70, r: 30 },
    { c: "#FFB020", e: "🚀", x: 265, y: 70, r: 28 },
    { c: "#38D39F", e: "👻", x: 40, y: 200, r: 26 },
    { c: "#4C9AFF", e: "🔎", x: 285, y: 200, r: 26 },
    { c: "#B67CFF", e: "❤️", x: 90, y: 290, r: 24 },
    { c: "#FF7AC6", e: "🐉", x: 240, y: 290, r: 24 },
  ];
  return (
    <SceneFrame>
      {/* glow */}
      <circle cx="170" cy="170" r="90" fill={BRAND.purple} opacity="0.25" filter="url(#soft)" />
      {/* avatar body */}
      <g filter="url(#drop)">
        <ellipse cx="170" cy="245" rx="60" ry="18" fill="url(#brand)" />
        <rect x="128" y="170" width="84" height="80" rx="34" fill="url(#brand)" />
        {/* head */}
        <circle cx="170" cy="150" r="46" fill="url(#metal)" />
        {/* headphones band */}
        <path d="M124 145 A46 46 0 0 1 216 145" stroke="#1A1220" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="124" cy="150" r="14" fill="#1A1220" />
        <circle cx="216" cy="150" r="14" fill="#1A1220" />
        <circle cx="124" cy="150" r="6" fill={BRAND.purple} />
        <circle cx="216" cy="150" r="6" fill={BRAND.purple} />
        {/* face */}
        <circle cx="156" cy="150" r="4" fill="#1A1220" />
        <circle cx="184" cy="150" r="4" fill="#1A1220" />
        <path d="M158 168 Q170 178 182 168" stroke="#1A1220" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* highlight */}
        <ellipse cx="152" cy="132" rx="12" ry="6" fill="#ffffff" opacity="0.35" />
      </g>
      {/* genre orbs */}
      {genres.map((g, i) => (
        <g key={i} filter="url(#drop)">
          <circle cx={g.x} cy={g.y} r={g.r} fill={g.c} />
          <ellipse cx={g.x - g.r * 0.3} cy={g.y - g.r * 0.4} rx={g.r * 0.45} ry={g.r * 0.22} fill="#ffffff" opacity="0.35" />
          <text x={g.x} y={g.y + g.r * 0.28} textAnchor="middle" fontSize={g.r * 0.95}>{g.e}</text>
        </g>
      ))}
    </SceneFrame>
  );
}

/** Payments — cards, UPI, wallet, netbanking, phone */
export function PaymentsScene() {
  return (
    <SceneFrame>
      {/* back card */}
      <g filter="url(#drop)" transform="translate(60 90) rotate(-14 90 55)">
        <rect width="180" height="110" rx="16" fill="url(#brand)" />
        <rect width="180" height="110" rx="16" fill="url(#glass)" />
        <rect x="16" y="22" width="34" height="24" rx="4" fill="#FFD37A" />
        <rect x="16" y="76" width="80" height="8" rx="3" fill="#ffffff" opacity="0.7" />
        <rect x="16" y="90" width="50" height="6" rx="3" fill="#ffffff" opacity="0.45" />
        <circle cx="152" cy="86" r="12" fill="#ffffff" opacity="0.9" />
        <circle cx="162" cy="86" r="12" fill="#FFB020" opacity="0.9" />
      </g>
      {/* front card */}
      <g filter="url(#drop)" transform="translate(90 130) rotate(8 90 55)">
        <rect width="180" height="110" rx="16" fill="#1A1220" />
        <rect width="180" height="110" rx="16" fill="url(#glass)" />
        <rect x="16" y="22" width="34" height="24" rx="4" fill="url(#metal)" />
        <rect x="16" y="76" width="90" height="8" rx="3" fill="#ffffff" opacity="0.7" />
        <rect x="16" y="90" width="60" height="6" rx="3" fill="#ffffff" opacity="0.4" />
        <text x="164" y="42" textAnchor="end" fill="#ffffff" fontSize="14" fontWeight="700" fontFamily="Kanit, sans-serif">VISA</text>
      </g>
      {/* UPI badge */}
      <g filter="url(#drop)" transform="translate(30 40)">
        <rect width="70" height="46" rx="14" fill="#ffffff" />
        <text x="35" y="30" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="Kanit, sans-serif" fill="#0C0C0C">UPI</text>
      </g>
      {/* wallet */}
      <g filter="url(#drop)" transform="translate(238 28)">
        <rect width="74" height="58" rx="12" fill="#38D39F" />
        <rect y="18" width="74" height="40" rx="12" fill="#1F9A6E" />
        <circle cx="58" cy="38" r="8" fill="#ffffff" />
        <circle cx="58" cy="38" r="3" fill="#1F9A6E" />
      </g>
      {/* bank / netbanking */}
      <g filter="url(#drop)" transform="translate(30 250)">
        <rect width="90" height="60" rx="10" fill="#4C9AFF" />
        <polygon points="45,4 8,26 82,26" fill="#ffffff" />
        <rect x="14" y="30" width="6" height="22" fill="#ffffff" />
        <rect x="28" y="30" width="6" height="22" fill="#ffffff" />
        <rect x="42" y="30" width="6" height="22" fill="#ffffff" />
        <rect x="56" y="30" width="6" height="22" fill="#ffffff" />
        <rect x="70" y="30" width="6" height="22" fill="#ffffff" />
        <rect x="6" y="52" width="78" height="6" fill="#ffffff" />
      </g>
      {/* phone with QR */}
      <g filter="url(#drop)" transform="translate(230 220)">
        <rect width="76" height="112" rx="14" fill="#1A1220" />
        <rect x="6" y="8" width="64" height="96" rx="8" fill="#ffffff" />
        {Array.from({ length: 25 }).map((_, i) => {
          const r = Math.floor(i / 5); const c = i % 5;
          const on = (r * 7 + c * 3) % 3 === 0;
          return <rect key={i} x={12 + c * 11} y={14 + r * 11} width="9" height="9" fill={on ? "#0C0C0C" : "#ffffff"} />;
        })}
      </g>
    </SceneFrame>
  );
}

/** Delivery — paper plane flying out of a phone with episode cards */
export function DeliveryScene() {
  return (
    <SceneFrame>
      <circle cx="230" cy="120" r="80" fill={BRAND.purple} opacity="0.25" filter="url(#soft)" />
      {/* phone */}
      <g filter="url(#drop)" transform="translate(50 60)">
        <rect width="120" height="220" rx="24" fill="#1A1220" />
        <rect x="8" y="14" width="104" height="192" rx="16" fill="#0C0C0C" />
        {/* episode cards */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(16 ${28 + i * 46})`}>
            <rect width="88" height="36" rx="8" fill="url(#brand)" opacity={0.9 - i * 0.15} />
            <circle cx="18" cy="18" r="10" fill="#ffffff" opacity="0.9" />
            <polygon points="15,13 15,23 24,18" fill={BRAND.violet} />
            <rect x="34" y="10" width="46" height="6" rx="2" fill="#ffffff" opacity="0.8" />
            <rect x="34" y="20" width="30" height="4" rx="2" fill="#ffffff" opacity="0.55" />
          </g>
        ))}
        {/* download arrow */}
        <g transform="translate(45 175)">
          <circle r="14" fill="#38D39F" />
          <path d="M0 -6 L0 5 M-5 0 L0 6 L5 0" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      {/* paper plane */}
      <g filter="url(#drop)" transform="translate(180 90) rotate(-18)">
        <polygon points="0,40 120,0 60,50 120,80" fill="url(#metal)" />
        <polygon points="60,50 120,80 90,44" fill="#ffffff" opacity="0.5" />
        <polygon points="0,40 60,50 40,72" fill="#ffffff" opacity="0.3" />
      </g>
      {/* motion trail */}
      <path d="M180 130 Q220 110 265 100" stroke={BRAND.purple} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="2 8" />
      <path d="M180 145 Q220 130 260 125" stroke={BRAND.violet} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" strokeDasharray="2 8" />
      {/* sparkles */}
      <g fill="#ffffff">
        <circle cx="285" cy="70" r="3" />
        <circle cx="300" cy="130" r="2" />
        <circle cx="255" cy="175" r="2.5" />
      </g>
    </SceneFrame>
  );
}

/** Support — headset agent with chat bubbles */
export function SupportScene() {
  return (
    <SceneFrame>
      <circle cx="170" cy="180" r="90" fill={BRAND.violet} opacity="0.3" filter="url(#soft)" />
      {/* chat bubbles */}
      <g filter="url(#drop)">
        <rect x="24" y="40" width="120" height="46" rx="18" fill="#ffffff" />
        <polygon points="40,86 34,102 58,86" fill="#ffffff" />
        <circle cx="54" cy="63" r="4" fill="#0C0C0C" opacity="0.7" />
        <circle cx="72" cy="63" r="4" fill="#0C0C0C" opacity="0.7" />
        <circle cx="90" cy="63" r="4" fill="#0C0C0C" opacity="0.7" />
      </g>
      <g filter="url(#drop)">
        <rect x="200" y="30" width="120" height="46" rx="18" fill="url(#brand)" />
        <polygon points="304,76 314,92 288,76" fill={BRAND.amber} />
        <rect x="216" y="46" width="60" height="6" rx="3" fill="#ffffff" opacity="0.9" />
        <rect x="216" y="58" width="82" height="6" rx="3" fill="#ffffff" opacity="0.7" />
      </g>
      {/* agent */}
      <g filter="url(#drop)" transform="translate(170 210)">
        <ellipse cx="0" cy="70" rx="70" ry="16" fill="url(#brand)" />
        <rect x="-50" y="0" width="100" height="80" rx="30" fill="url(#brand)" />
        <circle r="52" fill="url(#metal)" />
        {/* headphones */}
        <path d="M-52 0 A52 52 0 0 1 52 0" stroke="#1A1220" strokeWidth="9" fill="none" strokeLinecap="round" />
        <rect x="-64" y="-6" width="18" height="26" rx="9" fill="#1A1220" />
        <rect x="46" y="-6" width="18" height="26" rx="9" fill="#1A1220" />
        {/* mic boom */}
        <path d="M46 8 Q60 30 30 34" stroke="#1A1220" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="34" r="6" fill={BRAND.purple} />
        {/* face */}
        <circle cx="-14" cy="4" r="4" fill="#1A1220" />
        <circle cx="14" cy="4" r="4" fill="#1A1220" />
        <path d="M-10 22 Q0 32 10 22" stroke="#1A1220" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="-18" cy="-14" rx="12" ry="6" fill="#ffffff" opacity="0.35" />
      </g>
      {/* live dot */}
      <g transform="translate(280 200)">
        <circle r="14" fill="#38D39F" />
        <circle r="6" fill="#ffffff" />
      </g>
    </SceneFrame>
  );
}
