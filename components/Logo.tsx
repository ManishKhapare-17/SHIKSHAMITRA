// ============================================================
// ShikshaMitra AI Logo / Wordmark Component
// ============================================================

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const sizes = {
  sm: { icon: 28, text: 'text-lg', tagline: 'text-xs' },
  md: { icon: 36, text: 'text-xl', tagline: 'text-xs' },
  lg: { icon: 48, text: 'text-2xl', tagline: 'text-sm' },
};

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      {/* Logo mark — an open book with a star spark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="24" cy="24" r="24" fill="#8b5cf6" />
        {/* Open book pages */}
        <path
          d="M10 16 C10 14 12 13 14 13 L23 14 L23 35 L14 35 C12 35 10 34 10 32 Z"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M38 16 C38 14 36 13 34 13 L25 14 L25 35 L34 35 C36 35 38 34 38 32 Z"
          fill="white"
          opacity="0.9"
        />
        {/* Spine */}
        <line x1="24" y1="14" x2="24" y2="35" stroke="#8b5cf6" strokeWidth="1" />
        {/* Star spark */}
        <path
          d="M30 9 L31.5 12 L35 12 L32.5 14 L33.5 17.5 L30.5 15.5 L27.5 17.5 L28.5 14 L26 12 L29.5 12 Z"
          fill="#fbbf24"
        />
      </svg>

      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight leading-none ${s.text}`}
          style={{
            background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ShikshaMitra
          <span style={{ WebkitTextFillColor: '#fbbf24', fontWeight: 900 }}> AI</span>
        </span>
        {showTagline && (
          <span className={`${s.tagline} text-slate-500 font-medium tracking-wide mt-0.5`}>
            Your Learning Companion
          </span>
        )}
      </div>
    </div>
  );
}
