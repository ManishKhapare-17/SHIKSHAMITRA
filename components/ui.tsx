// ──── Reusable UI Primitives ─────────────────────────────────

import { type ReactNode } from 'react';

// ── Button ────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

const variants = {
  primary: 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-sm',
  secondary: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm',
  ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600',
  danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm',
};

const bSizes = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-6 py-3 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${bSizes[size]} ${className}`}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading…
        </>
      ) : children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode;
  color?: 'violet' | 'blue' | 'green' | 'amber' | 'red' | 'slate';
  className?: string;
}

const badgeColors = {
  violet: 'bg-violet-100 text-violet-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  slate: 'bg-slate-100 text-slate-600',
};

export function Badge({ children, color = 'violet', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors[color]} ${className}`}
    >
      {children}
    </span>
  );
}

// ── Section Title ─────────────────────────────────────────────

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-lg font-bold text-slate-800 ${className}`}>{children}</h2>
  );
}

// ── Loading Spinner ───────────────────────────────────────────

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
      className={`border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin inline-block ${className}`}
    />
  );
}

// ── Thinking Dots ─────────────────────────────────────────────

export function ThinkingDots() {
  return (
    <span className="flex items-center gap-1" aria-label="Thinking…">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 bg-violet-400 rounded-full dot-pulse ${i === 1 ? 'dot-pulse-delay-1' : i === 2 ? 'dot-pulse-delay-2' : ''}`}
        />
      ))}
    </span>
  );
}

// ── Empty State ───────────────────────────────────────────────

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <span className="text-5xl mb-4">{emoji}</span>
      <h3 className="text-lg font-bold text-slate-700 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-6">{message}</p>
      {action}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────

interface ProgressBarProps {
  value: number;   // 0–100
  color?: string;
  className?: string;
}

export function ProgressBar({ value, color = 'bg-violet-500', className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden h-2 ${className}`}>
      <div
        className={`h-full ${color} transition-all duration-500 rounded-full`}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
