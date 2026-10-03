import React from 'react';

export default function BrandLogo({ className = "w-9 h-9", withText = false, textClassName = "font-headline-lg text-on-surface" }) {
  return (
    <div className="flex items-center gap-space-sm select-none">
      <div className="relative flex items-center justify-center p-0.5 bg-surface-container-lowest rounded-xl shadow-xs">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${className} object-contain rounded-lg`}
        >
          <defs>
            <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#brandGradient)" />
          {/* Academic Cap & Sparkle AI */}
          <path d="M24 13L37 19.5L24 26L11 19.5L24 13Z" fill="white" />
          <path
            d="M16 22.5V30C16 32.5 19.6 34.5 24 34.5C28.4 34.5 32 32.5 32 30V22.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M37 19.5V28" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* AI Sparkle dot */}
          <circle cx="36" cy="13" r="2.5" fill="#38BDF8" />
        </svg>
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary opacity-30 blur-xs -z-10"></div>
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className={`${textClassName} tracking-tight leading-none`}>CampusMind</span>
            <span className="bg-primary-fixed text-on-primary-fixed font-label-sm px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-semibold">
              Copilot
            </span>
          </div>
          <span className="font-label-sm text-primary font-medium tracking-wide uppercase text-[10px]">
            Academic AI v3.4
          </span>
        </div>
      )}
    </div>
  );
}
