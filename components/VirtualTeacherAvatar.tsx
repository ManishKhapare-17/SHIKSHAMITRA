// ============================================================
// ShikshaMitra AI — Animated Virtual Teacher Avatar
// Personas: 'female' (Ananya Ma'am), 'male' (Rahul Sir)
// States: 'idle' | 'speaking' | 'paused' | 'loading' | 'error'
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import type { TeacherPersona } from '@/lib/types';

export type TeacherSpeechState = 'idle' | 'speaking' | 'paused' | 'loading' | 'error';

interface Props {
  persona?: TeacherPersona;
  isSpeaking?: boolean;
  speechState?: TeacherSpeechState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export default function VirtualTeacherAvatar({
  persona = 'female',
  isSpeaking = false,
  speechState,
  size = 'md',
  className = '',
  onClick,
}: Props) {
  // Resolve effective speech state (support both speechState prop and legacy isSpeaking boolean)
  const state: TeacherSpeechState = speechState || (isSpeaking ? 'speaking' : 'idle');
  const activeSpeaking = state === 'speaking';
  const isPaused = state === 'paused';
  const isLoading = state === 'loading';
  const isError = state === 'error';

  const [mouthFrame, setMouthFrame] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  // Synchronized lip-sync animation cycling through 4 realistic mouth shapes
  useEffect(() => {
    if (!activeSpeaking) return;
    const interval = setInterval(() => {
      setMouthFrame((prev) => (prev + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, [activeSpeaking]);

  // Periodic natural eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const pixelSize = size === 'sm' ? 56 : size === 'lg' ? 120 : size === 'xl' ? 144 : 80;

  const renderMouth = (gender: 'male' | 'female') => {
    const color = gender === 'female' ? '#b91c1c' : '#991b1b';
    if (isPaused) {
      return <ellipse cx="50" cy="53" rx="3.2" ry="1.2" fill={color} />;
    }
    if (isError) {
      return <path d="M 44 55 Q 50 51 56 55" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />;
    }
    if (activeSpeaking) {
      switch (mouthFrame) {
        case 0:
          // Slightly open mouth
          return (
            <g>
              <ellipse cx="50" cy="53" rx="3.5" ry="2" fill={color} />
              <rect x="48" y="51.5" width="4" height="1" rx="0.5" fill="#ffffff" />
            </g>
          );
        case 1:
          // Fully open vowel mouth
          return (
            <g>
              <ellipse cx="50" cy="54" rx="4.8" ry="4.5" fill={color} />
              <rect x="47" y="51" width="6" height="1.8" rx="0.5" fill="#ffffff" />
              <ellipse cx="50" cy="55.5" rx="3" ry="1.5" fill="#f87171" opacity="0.8" />
            </g>
          );
        case 2:
          // Wide open smile shape
          return (
            <g>
              <ellipse cx="50" cy="53.5" rx="5.5" ry="2.8" fill={color} />
              <rect x="46.5" y="51.5" width="7" height="1.5" rx="0.5" fill="#ffffff" />
            </g>
          );
        case 3:
        default:
          // Medium rounded shape
          return (
            <g>
              <ellipse cx="50" cy="54" rx="4" ry="3.5" fill={color} />
              <rect x="47.5" y="51.5" width="5" height="1.5" rx="0.5" fill="#ffffff" />
            </g>
          );
      }
    }
    // Idle resting warm smile
    return <path d="M 43 51 Q 50 56.5 57 51" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />;
  };

  if (persona === 'male') {
    // Rahul Sir — Friendly male teacher with glasses & tie
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-blue-100 to-indigo-100 p-2 shadow-inner select-none transition-transform ${
          onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        } ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        role="img"
        aria-label={`Rahul Sir, Virtual AI Teacher (${state})`}
      >
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full transition-transform ${activeSpeaking ? 'scale-[1.02]' : ''}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hair */}
          <path d="M 28 35 C 26 18 42 12 55 12 C 68 12 76 20 74 35 Z" fill="#1e293b" />
          {/* Face */}
          <circle cx="50" cy="42" r="24" fill="#fed7aa" />
          {/* Ears */}
          <circle cx="26" cy="44" r="5" fill="#fdba74" />
          <circle cx="74" cy="44" r="5" fill="#fdba74" />
          {/* Glasses frame */}
          <rect x="34" y="34" width="13" height="11" rx="3" stroke="#0f172a" strokeWidth="2.5" fill="none" />
          <rect x="53" y="34" width="13" height="11" rx="3" stroke="#0f172a" strokeWidth="2.5" fill="none" />
          <line x1="47" y1="39" x2="53" y2="39" stroke="#0f172a" strokeWidth="2" />
          {/* Eyes behind glasses */}
          {isBlinking ? (
            <g>
              <path d="M 37.5 39.5 Q 40.5 41.5 43.5 39.5" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
              <path d="M 56.5 39.5 Q 59.5 41.5 62.5 39.5" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <circle cx="40.5" cy="39.5" r="2.5" fill="#0f172a" />
              <circle cx="41.3" cy="38.7" r="0.8" fill="#ffffff" />
              <circle cx="59.5" cy="39.5" r="2.5" fill="#0f172a" />
              <circle cx="60.3" cy="38.7" r="0.8" fill="#ffffff" />
            </g>
          )}
          {/* Eyebrows */}
          <path d="M 35 30 Q 41 28 47 31" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <path d="M 53 31 Q 59 28 65 30" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          {/* Nose */}
          <path d="M 50 42 L 49 46 L 52 46" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />

          {/* Synchronized Viseme Mouth */}
          {renderMouth('male')}

          {/* Clothes — Shirt and Tie */}
          <path d="M 28 80 C 30 64 42 62 50 62 C 58 62 70 64 72 80 Z" fill="#2563eb" />
          {/* Collar */}
          <polygon points="44,62 50,70 41,66" fill="#ffffff" />
          <polygon points="56,62 50,70 59,66" fill="#ffffff" />
          {/* Tie */}
          <polygon points="48,68 52,68 53,82 47,82" fill="#ef4444" />
        </svg>

        {/* Status Badges */}
        {activeSpeaking && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 text-[9px] text-white font-bold items-center justify-center">
              🎙️
            </span>
          </span>
        )}
        {isPaused && (
          <span className="absolute -bottom-1 -right-1 inline-flex rounded-full h-4 w-4 bg-amber-500 text-[8px] text-white font-bold items-center justify-center shadow-xs">
            ⏸️
          </span>
        )}
        {isLoading && (
          <span className="absolute -bottom-1 -right-1 inline-flex rounded-full h-4 w-4 bg-violet-600 text-[8px] text-white font-bold items-center justify-center shadow-xs animate-spin">
            ⏳
          </span>
        )}
        {isError && (
          <span className="absolute -bottom-1 -right-1 inline-flex rounded-full h-4 w-4 bg-red-600 text-[8px] text-white font-bold items-center justify-center shadow-xs">
            ⚠️
          </span>
        )}
      </div>
    );
  }

  // Ananya Ma'am — Friendly female teacher with smile & spectacles
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-purple-100 to-violet-100 p-2 shadow-inner select-none transition-transform ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      role="img"
      aria-label={`Ananya Ma'am, Virtual AI Teacher (${state})`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full transition-transform ${activeSpeaking ? 'scale-[1.02]' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Long hair background */}
        <path d="M 24 35 C 20 18 38 10 50 10 C 62 10 80 18 76 35 C 78 50 82 70 78 78 C 65 72 65 70 65 65 L 35 65 C 35 70 35 72 22 78 C 18 70 22 50 24 35 Z" fill="#312e81" />
        {/* Face */}
        <circle cx="50" cy="42" r="23" fill="#fed7aa" />
        {/* Front Hair Bangs */}
        <path d="M 27 34 Q 38 20 52 24 Q 65 20 73 34 C 67 26 58 24 50 25 C 42 24 33 26 27 34 Z" fill="#1e1b4b" />
        {/* Ears & Earrings */}
        <circle cx="27" cy="44" r="4.5" fill="#fdba74" />
        <circle cx="73" cy="44" r="4.5" fill="#fdba74" />
        <circle cx="26" cy="49" r="2" fill="#fbbf24" />
        <circle cx="74" cy="49" r="2" fill="#fbbf24" />
        {/* Eyeglasses */}
        <circle cx="41" cy="40" r="7" stroke="#7c3aed" strokeWidth="2" fill="none" />
        <circle cx="59" cy="40" r="7" stroke="#7c3aed" strokeWidth="2" fill="none" />
        <line x1="48" y1="40" x2="52" y2="40" stroke="#7c3aed" strokeWidth="2" />
        {/* Eyes behind glasses */}
        {isBlinking ? (
          <g>
            <path d="M 37.5 39.5 Q 40.5 41.5 43.5 39.5" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
            <path d="M 56.5 39.5 Q 59.5 41.5 62.5 39.5" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx="41" cy="40" r="2.5" fill="#1e1b4b" />
            <circle cx="41.8" cy="39.2" r="0.8" fill="#ffffff" />
            <circle cx="59" cy="40" r="2.5" fill="#1e1b4b" />
            <circle cx="59.8" cy="39.2" r="0.8" fill="#ffffff" />
          </g>
        )}
        {/* Bindi */}
        <circle cx="50" cy="33" r="1.5" fill="#dc2626" />
        {/* Eyebrows */}
        <path d="M 35 32 Q 41 30 47 32" stroke="#4338ca" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 53 32 Q 59 30 65 32" stroke="#4338ca" strokeWidth="1.8" strokeLinecap="round" />
        {/* Nose */}
        <path d="M 50 42 L 49 46 L 52 46" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />

        {/* Synchronized Viseme Mouth */}
        {renderMouth('female')}

        {/* Clothes — Saree/Kurti */}
        <path d="M 26 80 C 28 64 40 61 50 61 C 60 61 72 64 74 80 Z" fill="#7c3aed" />
        {/* Shawl / Border */}
        <path d="M 34 62 Q 46 72 40 82" stroke="#f59e0b" strokeWidth="3" fill="none" />
      </svg>

      {/* Status Badges */}
      {activeSpeaking && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-violet-600 text-[9px] text-white font-bold items-center justify-center">
            🎙️
          </span>
        </span>
      )}
      {isPaused && (
        <span className="absolute -bottom-1 -right-1 inline-flex rounded-full h-4 w-4 bg-amber-500 text-[8px] text-white font-bold items-center justify-center shadow-xs">
          ⏸️
        </span>
      )}
      {isLoading && (
        <span className="absolute -bottom-1 -right-1 inline-flex rounded-full h-4 w-4 bg-violet-600 text-[8px] text-white font-bold items-center justify-center shadow-xs animate-spin">
          ⏳
        </span>
      )}
      {isError && (
        <span className="absolute -bottom-1 -right-1 inline-flex rounded-full h-4 w-4 bg-red-600 text-[8px] text-white font-bold items-center justify-center shadow-xs">
          ⚠️
        </span>
      )}
    </div>
  );
}
