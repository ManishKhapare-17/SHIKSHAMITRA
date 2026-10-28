// ============================================================
// Visual illustrations for lessons (CSS/SVG — no external URLs)
// ============================================================

// ── Fraction Diagram ──────────────────────────────────────────
export function FractionDiagram() {
  return (
    <div className="flex flex-wrap gap-6 items-start justify-center py-2">
      {/* Pizza model */}
      <div className="flex flex-col items-center gap-2">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-label="Pizza divided into 8 slices, 3 highlighted">
          {/* Full circle background */}
          <circle cx="60" cy="60" r="55" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
          {/* 8 slices — 3 highlighted */}
          {Array.from({ length: 8 }).map((_, i) => {
            const startAngle = (i * 360) / 8 - 90;
            const endAngle = ((i + 1) * 360) / 8 - 90;
            const r = 55;
            const cx = 60, cy = 60;
            const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
            const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
            const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
            const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
            const highlighted = i < 3;
            return (
              <g key={i}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                  fill={highlighted ? '#f97316' : '#fde68a'}
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            );
          })}
          {/* Fraction label */}
          <text x="60" y="64" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#7c2d12">3/8</text>
        </svg>
        <p className="text-xs text-slate-600 text-center max-w-24">3 slices eaten out of 8 total</p>
      </div>

      {/* Number line fraction */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-semibold text-slate-600">Parts of a Whole</p>
        <div className="flex gap-3">
          {[
            { label: '1/4', parts: 4, filled: 1, color: '#8b5cf6' },
            { label: '1/2', parts: 2, filled: 1, color: '#3b82f6' },
            { label: '3/4', parts: 4, filled: 3, color: '#10b981' },
          ].map(({ label, parts, filled, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: parts }).map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded border-2"
                    style={{
                      backgroundColor: i < filled ? color : '#f1f5f9',
                      borderColor: color,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold" style={{ color }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Water Cycle Diagram ────────────────────────────────────────
export function WaterCycleDiagram() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <svg viewBox="0 0 320 220" aria-label="Water cycle diagram showing evaporation, condensation, precipitation and collection">
        {/* Sky background */}
        <rect width="320" height="220" fill="#e0f2fe" rx="12" />
        {/* Ground */}
        <ellipse cx="160" cy="200" rx="140" ry="25" fill="#6ee7b7" />
        <rect x="20" y="195" width="280" height="25" fill="#6ee7b7" rx="0" />
        {/* Water body */}
        <ellipse cx="80" cy="198" rx="55" ry="12" fill="#38bdf8" />
        <text x="80" y="200" textAnchor="middle" fontSize="8" fill="#0c4a6e" fontWeight="bold">Ocean / River</text>
        {/* Sun */}
        <circle cx="270" cy="45" r="28" fill="#fbbf24" />
        <text x="270" y="49" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">☀️</text>
        {/* Cloud */}
        <ellipse cx="140" cy="50" rx="45" ry="22" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
        <ellipse cx="120" cy="58" rx="30" ry="18" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
        <ellipse cx="165" cy="58" rx="32" ry="18" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
        <text x="140" y="54" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="bold">Cloud ☁️</text>

        {/* Evaporation arrows */}
        <path d="M 80 182 Q 100 130 120 80" stroke="#f97316" strokeWidth="2.5" fill="none" strokeDasharray="5,3" markerEnd="url(#arrowOrange)" />
        <text x="60" y="140" fontSize="8" fill="#c2410c" fontWeight="bold" transform="rotate(-55, 60, 140)">Evaporation</text>

        {/* Condensation label */}
        <text x="170" y="32" fontSize="8" fill="#7c3aed" fontWeight="bold">Condensation</text>
        <path d="M 190 38 L 190 48" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrowPurple)" />

        {/* Precipitation arrows */}
        {[145, 157, 169].map((x, i) => (
          <line key={i} x1={x} y1="76" x2={x - 5} y2="108" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowBlue)" />
        ))}
        <text x="175" y="95" fontSize="8" fill="#1d4ed8" fontWeight="bold">Precipitation</text>

        {/* Collection arrows */}
        <path d="M 150 185 Q 120 190 95 192" stroke="#10b981" strokeWidth="2.5" fill="none" markerEnd="url(#arrowGreen)" />
        <text x="145" y="184" fontSize="8" fill="#065f46" fontWeight="bold">Collection</text>

        {/* Arrow markers */}
        <defs>
          {[
            { id: 'arrowOrange', color: '#f97316' },
            { id: 'arrowBlue', color: '#3b82f6' },
            { id: 'arrowGreen', color: '#10b981' },
            { id: 'arrowPurple', color: '#7c3aed' },
          ].map(({ id, color }) => (
            <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 Z" fill={color} />
            </marker>
          ))}
        </defs>
      </svg>
    </div>
  );
}

// ── Noun Types Diagram ─────────────────────────────────────────
export function NounDiagram() {
  const types = [
    { label: 'Common', example: 'girl, city, book', color: '#3b82f6', bg: '#eff6ff', emoji: '📚' },
    { label: 'Proper', example: 'Priya, Mumbai', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🏙️' },
    { label: 'Concrete', example: 'apple, rain', color: '#10b981', bg: '#f0fdf4', emoji: '🍎' },
    { label: 'Abstract', example: 'love, courage', color: '#f59e0b', bg: '#fffbeb', emoji: '💛' },
    { label: 'Collective', example: 'herd, team', color: '#ef4444', bg: '#fef2f2', emoji: '🐘' },
  ];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-20 h-10 rounded-t-full flex items-center justify-center font-black text-white text-sm" style={{ background: '#1e293b' }}>
        NOUN
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {types.map(({ label, example, color, bg, emoji }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-center border"
            style={{ backgroundColor: bg, borderColor: color + '40' }}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-xs font-bold" style={{ color }}>{label}</span>
            <span className="text-xs text-slate-500">{example}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
