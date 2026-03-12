'use client';

export function TemplatePickerAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect className="anim-template-1" x="8" y="12" width="26" height="34" rx="3" fill="#E8EDF3" stroke="#1B395D" strokeWidth="1.5"/>
        <rect x="12" y="17" width="18" height="2" rx="1" fill="#1B395D" opacity="0.3"/>
        <rect x="12" y="21" width="14" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="12" y="25" width="16" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="12" y="29" width="12" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="12" y="35" width="18" height="2" rx="1" fill="#E57D30" opacity="0.4"/>
        <rect x="12" y="39" width="14" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>

        <rect className="anim-template-2" x="30" y="8" width="26" height="34" rx="3" fill="white" stroke="#E57D30" strokeWidth="2"/>
        <rect x="34" y="13" width="18" height="2.5" rx="1" fill="#E57D30" opacity="0.6"/>
        <rect x="34" y="18" width="14" height="1.5" rx="0.75" fill="#1B395D" opacity="0.3"/>
        <rect x="34" y="22" width="16" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="34" y="26" width="12" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="34" y="32" width="18" height="2" rx="1" fill="#1B395D" opacity="0.3"/>
        <rect x="34" y="36" width="10" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>

        <rect className="anim-template-3" x="46" y="16" width="26" height="34" rx="3" fill="#F0F4F8" stroke="#1B395D" strokeWidth="1"/>
        <rect x="50" y="21" width="18" height="2" rx="1" fill="#1B395D" opacity="0.25"/>
        <rect x="50" y="25" width="14" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>
        <rect x="50" y="29" width="16" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>

        <circle className="anim-check" cx="60" cy="56" r="10" fill="#E57D30" opacity="0.9"/>
        <path className="anim-check-mark" d="M55 56L58.5 59.5L65 53" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      <style jsx>{`
        .anim-template-1 { animation: tmplSlide 3s ease-in-out infinite; }
        .anim-template-2 { animation: tmplPop 3s ease-in-out infinite; }
        .anim-template-3 { animation: tmplSlide 3s ease-in-out 0.5s infinite; }
        .anim-check { animation: checkPulse 3s ease-in-out infinite; }
        .anim-check-mark { animation: checkDraw 3s ease-in-out infinite; stroke-dasharray: 20; stroke-dashoffset: 20; }
        @keyframes tmplSlide { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes tmplPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes checkPulse { 0%,100% { opacity: 0; transform: scale(0.5); } 30%,80% { opacity: 0.9; transform: scale(1); } }
        @keyframes checkDraw { 0%,20% { stroke-dashoffset: 20; } 40%,100% { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

export function TypingAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="10" y="10" width="60" height="60" rx="6" fill="white" stroke="#1B395D" strokeWidth="1.5" opacity="0.9"/>
        <rect x="16" y="18" width="28" height="3" rx="1.5" fill="#1B395D" opacity="0.6"/>
        <rect className="anim-type-line1" x="16" y="26" width="0" height="2" rx="1" fill="#E57D30" opacity="0.8"/>
        <rect className="anim-type-line2" x="16" y="32" width="0" height="2" rx="1" fill="#1B395D" opacity="0.3"/>
        <rect className="anim-type-line3" x="16" y="38" width="0" height="2" rx="1" fill="#1B395D" opacity="0.3"/>

        <rect x="16" y="46" width="48" height="0.5" rx="0.25" fill="#1B395D" opacity="0.1"/>

        <rect className="anim-type-line4" x="16" y="52" width="0" height="2" rx="1" fill="#1B395D" opacity="0.25"/>
        <rect className="anim-type-line5" x="16" y="58" width="0" height="2" rx="1" fill="#1B395D" opacity="0.25"/>

        <rect className="anim-cursor" x="16" y="25" width="1.5" height="4" rx="0.5" fill="#E57D30"/>

        <circle className="anim-ai-dot" cx="60" cy="20" r="6" fill="#E57D30" opacity="0"/>
        <path className="anim-ai-spark" d="M58 18L60 16L62 18L60 20Z" fill="white" opacity="0"/>
      </svg>
      <style jsx>{`
        .anim-type-line1 { animation: typeLine 4s ease-out infinite; }
        .anim-type-line2 { animation: typeLine 4s ease-out 0.6s infinite; }
        .anim-type-line3 { animation: typeLine 4s ease-out 1.2s infinite; }
        .anim-type-line4 { animation: typeLineShort 4s ease-out 1.8s infinite; }
        .anim-type-line5 { animation: typeLineShort 4s ease-out 2.2s infinite; }
        .anim-cursor { animation: cursorBlink 0.8s step-end infinite, cursorMove 4s ease-out infinite; }
        .anim-ai-dot { animation: aiDotPop 4s ease-in-out infinite; }
        .anim-ai-spark { animation: aiSpark 4s ease-in-out infinite; }
        @keyframes typeLine { 0% { width: 0; } 30% { width: 48px; } 100% { width: 48px; } }
        @keyframes typeLineShort { 0% { width: 0; } 30% { width: 36px; } 100% { width: 36px; } }
        @keyframes cursorBlink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }
        @keyframes cursorMove { 0% { transform: translateY(0); } 25% { transform: translateY(6px); } 50% { transform: translateY(12px); } 75% { transform: translateY(26px); } 100% { transform: translateY(32px); } }
        @keyframes aiDotPop { 0%,60% { opacity: 0; transform: scale(0.5); } 70%,90% { opacity: 0.9; transform: scale(1); } 100% { opacity: 0; } }
        @keyframes aiSpark { 0%,60% { opacity: 0; } 70%,90% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}

export function DownloadAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="18" y="8" width="44" height="56" rx="4" fill="white" stroke="#1B395D" strokeWidth="1.5" opacity="0.9"/>
        <rect x="24" y="16" width="24" height="2.5" rx="1" fill="#1B395D" opacity="0.5"/>
        <rect x="24" y="22" width="32" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="24" y="26" width="28" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="24" y="30" width="32" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="24" y="36" width="20" height="2" rx="1" fill="#E57D30" opacity="0.4"/>
        <rect x="24" y="40" width="30" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>
        <rect x="24" y="44" width="26" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>
        <rect x="24" y="50" width="18" height="2" rx="1" fill="#1B395D" opacity="0.3"/>
        <rect x="24" y="54" width="28" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>

        <g className="anim-download-arrow">
          <circle cx="40" cy="68" r="10" fill="#10B981" opacity="0.9"/>
          <path d="M36 66L40 70L44 66" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="40" y1="62" x2="40" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </g>

        <rect className="anim-progress" x="22" y="58" width="0" height="2" rx="1" fill="#10B981" opacity="0.6"/>
      </svg>
      <style jsx>{`
        .anim-download-arrow { animation: downloadBounce 2.5s ease-in-out infinite; }
        .anim-progress { animation: progressFill 2.5s ease-out infinite; }
        @keyframes downloadBounce { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-4px); } 60% { transform: translateY(2px); } }
        @keyframes progressFill { 0% { width: 0; } 60% { width: 36px; } 80%,100% { width: 36px; opacity: 0; } }
      `}</style>
    </div>
  );
}

export function AIWritingAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="8" width="48" height="48" rx="6" fill="white" stroke="#7C3AED" strokeWidth="1.2" opacity="0.9"/>
        <rect className="ai-write-1" x="14" y="16" width="0" height="2.5" rx="1" fill="#7C3AED" opacity="0.6"/>
        <rect className="ai-write-2" x="14" y="22" width="0" height="2" rx="1" fill="#1B395D" opacity="0.3"/>
        <rect className="ai-write-3" x="14" y="27" width="0" height="2" rx="1" fill="#1B395D" opacity="0.3"/>
        <rect className="ai-write-4" x="14" y="34" width="0" height="2" rx="1" fill="#E57D30" opacity="0.5"/>
        <rect className="ai-write-5" x="14" y="39" width="0" height="2" rx="1" fill="#1B395D" opacity="0.25"/>
        <rect className="ai-write-6" x="14" y="44" width="0" height="2" rx="1" fill="#1B395D" opacity="0.25"/>
        <circle className="ai-glow" cx="50" cy="14" r="8" fill="#7C3AED" opacity="0"/>
        <text className="ai-label" x="46" y="17" fontSize="8" fill="white" fontWeight="bold" opacity="0">AI</text>
      </svg>
      <style jsx>{`
        .ai-write-1 { animation: aiType 3.5s ease-out infinite; }
        .ai-write-2 { animation: aiType 3.5s ease-out 0.3s infinite; }
        .ai-write-3 { animation: aiType 3.5s ease-out 0.6s infinite; }
        .ai-write-4 { animation: aiType 3.5s ease-out 0.9s infinite; }
        .ai-write-5 { animation: aiTypeShort 3.5s ease-out 1.2s infinite; }
        .ai-write-6 { animation: aiTypeShort 3.5s ease-out 1.5s infinite; }
        .ai-glow { animation: glowPulse 3.5s ease-in-out infinite; }
        .ai-label { animation: glowPulse 3.5s ease-in-out infinite; }
        @keyframes aiType { 0% { width: 0; } 25% { width: 36px; } 100% { width: 36px; } }
        @keyframes aiTypeShort { 0% { width: 0; } 25% { width: 28px; } 100% { width: 28px; } }
        @keyframes glowPulse { 0%,100% { opacity: 0; } 20%,80% { opacity: 0.9; } }
      `}</style>
    </div>
  );
}

export function KeywordHighlightAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="6" y="10" width="52" height="44" rx="5" fill="white" stroke="#059669" strokeWidth="1.2" opacity="0.9"/>
        <rect x="12" y="18" width="28" height="2.5" rx="1" fill="#1B395D" opacity="0.4"/>
        <rect className="kw-hl-1" x="12" y="24" width="16" height="2.5" rx="1" fill="#059669" opacity="0"/>
        <rect x="30" y="24" width="14" height="2" rx="1" fill="#1B395D" opacity="0.2"/>
        <rect x="12" y="30" width="20" height="2" rx="1" fill="#1B395D" opacity="0.2"/>
        <rect className="kw-hl-2" x="34" y="30" width="14" height="2.5" rx="1" fill="#059669" opacity="0"/>
        <rect x="12" y="36" width="24" height="2" rx="1" fill="#1B395D" opacity="0.2"/>
        <rect className="kw-hl-3" x="12" y="42" width="18" height="2.5" rx="1" fill="#E57D30" opacity="0"/>
        <rect x="32" y="42" width="16" height="2" rx="1" fill="#1B395D" opacity="0.2"/>
      </svg>
      <style jsx>{`
        .kw-hl-1 { animation: highlight 3s ease-in-out infinite; }
        .kw-hl-2 { animation: highlight 3s ease-in-out 0.8s infinite; }
        .kw-hl-3 { animation: highlight 3s ease-in-out 1.6s infinite; }
        @keyframes highlight { 0%,100% { opacity: 0; } 20%,80% { opacity: 0.7; } }
      `}</style>
    </div>
  );
}

export function FormatAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="8" width="48" height="48" rx="5" fill="white" stroke="#E57D30" strokeWidth="1.2" opacity="0.9"/>
        <rect className="fmt-block-1" x="14" y="14" width="36" height="8" rx="2" fill="#E57D30" opacity="0.1" stroke="#E57D30" strokeWidth="0.5"/>
        <rect x="18" y="17" width="16" height="2" rx="1" fill="#1B395D" opacity="0.4"/>
        <rect className="fmt-block-2" x="14" y="26" width="36" height="12" rx="2" fill="#1B395D" opacity="0.03" stroke="#1B395D" strokeWidth="0.5" strokeDasharray="2 2"/>
        <rect x="18" y="29" width="20" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="18" y="33" width="28" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>
        <rect className="fmt-block-3" x="14" y="42" width="36" height="8" rx="2" fill="#059669" opacity="0.05" stroke="#059669" strokeWidth="0.5"/>
        <rect x="18" y="45" width="14" height="2" rx="1" fill="#059669" opacity="0.3"/>
      </svg>
      <style jsx>{`
        .fmt-block-1 { animation: fmtShift 4s ease-in-out infinite; }
        .fmt-block-2 { animation: fmtShift 4s ease-in-out 0.3s infinite; }
        .fmt-block-3 { animation: fmtShift 4s ease-in-out 0.6s infinite; }
        @keyframes fmtShift { 0%,100% { transform: translateX(0); opacity: 0.8; } 50% { transform: translateX(2px); opacity: 1; } }
      `}</style>
    </div>
  );
}

export function ShieldAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path className="shield-body" d="M32 6L10 18V34C10 46 20 56 32 58C44 56 54 46 54 34V18L32 6Z" fill="#F43F5E" opacity="0.08" stroke="#F43F5E" strokeWidth="1.5"/>
        <path className="shield-check" d="M24 32L30 38L42 26" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect className="shield-scan" x="16" y="20" width="32" height="1" fill="#F43F5E" opacity="0"/>
      </svg>
      <style jsx>{`
        .shield-body { animation: shieldPulse 3s ease-in-out infinite; }
        .shield-check { stroke-dasharray: 30; stroke-dashoffset: 30; animation: shieldDraw 3s ease-out infinite; }
        .shield-scan { animation: scanLine 3s ease-in-out infinite; }
        @keyframes shieldPulse { 0%,100% { opacity: 0.08; } 50% { opacity: 0.15; } }
        @keyframes shieldDraw { 0%,20% { stroke-dashoffset: 30; } 50%,100% { stroke-dashoffset: 0; } }
        @keyframes scanLine { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 0.4; } 80% { opacity: 0.4; } 100% { transform: translateY(24px); opacity: 0; } }
      `}</style>
    </div>
  );
}

export function ClockAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="32" r="24" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" opacity="0.9"/>
        <circle cx="32" cy="32" r="2" fill="#1B395D"/>
        <line className="clock-minute" x1="32" y1="32" x2="32" y2="16" stroke="#1B395D" strokeWidth="2" strokeLinecap="round"/>
        <line className="clock-hour" x1="32" y1="32" x2="42" y2="26" stroke="#E57D30" strokeWidth="2.5" strokeLinecap="round"/>
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
          <circle key={i} cx={32 + 20 * Math.cos((i * 30 - 90) * Math.PI / 180)} cy={32 + 20 * Math.sin((i * 30 - 90) * Math.PI / 180)} r={i % 3 === 0 ? 2 : 1} fill="#1B395D" opacity={i % 3 === 0 ? 0.4 : 0.2}/>
        ))}
        <circle className="clock-pulse" cx="32" cy="32" r="24" fill="none" stroke="#F59E0B" strokeWidth="0.5" opacity="0"/>
      </svg>
      <style jsx>{`
        .clock-minute { transform-origin: 32px 32px; animation: minuteHand 8s linear infinite; }
        .clock-hour { transform-origin: 32px 32px; animation: hourHand 24s linear infinite; }
        .clock-pulse { animation: clockRing 3s ease-out infinite; }
        @keyframes minuteHand { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes hourHand { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes clockRing { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.3); opacity: 0; } }
      `}</style>
    </div>
  );
}

export function ExportAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="12" y="10" width="34" height="44" rx="4" fill="white" stroke="#3B82F6" strokeWidth="1.2" opacity="0.9"/>
        <rect x="17" y="17" width="20" height="2" rx="1" fill="#1B395D" opacity="0.4"/>
        <rect x="17" y="22" width="24" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="17" y="26" width="18" height="1.5" rx="0.75" fill="#1B395D" opacity="0.2"/>
        <rect x="17" y="32" width="14" height="2" rx="1" fill="#3B82F6" opacity="0.3"/>
        <rect x="17" y="37" width="22" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>
        <rect x="17" y="41" width="16" height="1.5" rx="0.75" fill="#1B395D" opacity="0.15"/>

        <g className="export-fly">
          <rect x="34" y="20" width="22" height="28" rx="3" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" opacity="0.95"/>
          <text x="39" y="32" fontSize="6" fill="#3B82F6" fontWeight="bold" opacity="0.7">PDF</text>
          <path d="M42 38L45 41L48 38" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      </svg>
      <style jsx>{`
        .export-fly { animation: exportSlide 3s ease-in-out infinite; }
        @keyframes exportSlide { 0%,100% { transform: translate(0, 0); opacity: 0.5; } 50% { transform: translate(4px, -4px); opacity: 1; } }
      `}</style>
    </div>
  );
}

export function GlobeAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="32" r="22" fill="#EFF6FF" stroke="#059669" strokeWidth="1.5" opacity="0.9"/>
        <ellipse className="globe-spin" cx="32" cy="32" rx="10" ry="22" fill="none" stroke="#059669" strokeWidth="1" opacity="0.4"/>
        <line x1="10" y1="32" x2="54" y2="32" stroke="#059669" strokeWidth="0.8" opacity="0.3"/>
        <line x1="32" y1="10" x2="32" y2="54" stroke="#059669" strokeWidth="0.8" opacity="0.3"/>
        <ellipse cx="32" cy="22" rx="18" ry="0" fill="none" stroke="#059669" strokeWidth="0.5" opacity="0.2"/>

        <text className="globe-en" x="20" y="30" fontSize="7" fill="#059669" fontWeight="bold" opacity="0">EN</text>
        <text className="globe-ar" x="36" y="40" fontSize="7" fill="#E57D30" fontWeight="bold" opacity="0">ع</text>
      </svg>
      <style jsx>{`
        .globe-spin { animation: globeRotate 6s linear infinite; transform-origin: 32px 32px; }
        .globe-en { animation: langFade 4s ease-in-out infinite; }
        .globe-ar { animation: langFade 4s ease-in-out 2s infinite; }
        @keyframes globeRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes langFade { 0%,100% { opacity: 0; } 30%,70% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}

export function LinkedInToolAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect className="li-bg" x="6" y="6" width="52" height="52" rx="12" fill="#0A66C2" />
        <path className="li-letter-i-dot" d="M16 18 h6 v4 h-6 z" fill="#FFFFFF" rx="1" />
        <rect className="li-letter-i" x="16" y="26" width="6" height="20" rx="1" fill="#FFFFFF" />
        <path className="li-letter-n" d="M28 26 h6 v2 c2-3 5-4 8-4 c6 0 8 4 8 9 v13 h-6 V34 c0-3-1-5-4-5 s-6 2-6 5 v12 h-6 V26z" fill="#FFFFFF" />
        <circle className="li-spark-1" cx="14" cy="10" r="2" fill="#0A66C2" opacity="0" />
        <circle className="li-spark-2" cx="54" cy="10" r="2" fill="#0A66C2" opacity="0" />
        <circle className="li-spark-3" cx="54" cy="54" r="2" fill="#0A66C2" opacity="0" />
        <circle className="li-ring" cx="32" cy="32" r="28" fill="none" stroke="#0A66C2" strokeWidth="1" opacity="0" />
      </svg>
      <style jsx>{`
        .li-bg { animation: liBgPulse 3s ease-in-out infinite; }
        .li-spark-1 { animation: liSpark 3s ease-in-out 0.2s infinite; }
        .li-spark-2 { animation: liSpark 3s ease-in-out 0.5s infinite; }
        .li-spark-3 { animation: liSpark 3s ease-in-out 0.8s infinite; }
        .li-ring { animation: liRing 3s ease-out infinite; }
        @keyframes liBgPulse { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
        @keyframes liSpark { 0%,30% { opacity: 0; transform: scale(0.5); } 50%,80% { opacity: 0.7; transform: scale(1); } 100% { opacity: 0; transform: scale(0.5); } }
        @keyframes liRing { 0% { transform: scale(1); opacity: 0.2; } 100% { transform: scale(1.15); opacity: 0; } }
      `}</style>
    </div>
  );
}

export function InterviewAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="6" y="10" width="34" height="24" rx="5" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1.2" opacity="0.9"/>
        <rect className="iv-dot-1" x="14" y="19" width="0" height="2" rx="1" fill="#7C3AED" opacity="0.5"/>
        <rect className="iv-dot-2" x="14" y="24" width="0" height="2" rx="1" fill="#7C3AED" opacity="0.3"/>
        <path className="iv-tail-l" d="M10 34L6 40L16 36" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1.2" opacity="0"/>
        <rect className="iv-bubble-r" x="24" y="30" width="34" height="22" rx="5" fill="#EFF8FF" stroke="#0891B2" strokeWidth="1.2" opacity="0"/>
        <rect className="iv-dot-3" x="32" y="38" width="0" height="2" rx="1" fill="#0891B2" opacity="0.5"/>
        <rect className="iv-dot-4" x="32" y="43" width="0" height="2" rx="1" fill="#0891B2" opacity="0.3"/>
      </svg>
      <style jsx>{`
        .iv-dot-1 { animation: ivType 4s ease-out infinite; }
        .iv-dot-2 { animation: ivType 4s ease-out 0.4s infinite; }
        .iv-tail-l { animation: ivFade 4s ease-in-out infinite; }
        .iv-bubble-r { animation: ivBubble 4s ease-in-out 1.5s infinite; }
        .iv-dot-3 { animation: ivType 4s ease-out 2s infinite; }
        .iv-dot-4 { animation: ivType 4s ease-out 2.4s infinite; }
        @keyframes ivType { 0% { width: 0; } 25% { width: 24px; } 100% { width: 24px; } }
        @keyframes ivFade { 0%,80% { opacity: 0; } 85%,95% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes ivBubble { 0%,10% { opacity: 0; } 20%,90% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}

export function CareerCoachAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="32" r="24" fill="#FFF7ED" stroke="#E57D30" strokeWidth="1.2" opacity="0.9"/>
        <circle cx="32" cy="24" r="7" fill="#E57D30" opacity="0.15" stroke="#E57D30" strokeWidth="1"/>
        <circle className="cc-avatar" cx="32" cy="24" r="5" fill="#E57D30" opacity="0.4"/>
        <path className="cc-path" d="M20 44 Q32 34 44 44" stroke="#E57D30" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="30" strokeDashoffset="30"/>
        <circle className="cc-star-1" cx="20" cy="16" r="2" fill="#E57D30" opacity="0"/>
        <circle className="cc-star-2" cx="44" cy="16" r="2" fill="#E57D30" opacity="0"/>
        <circle className="cc-star-3" cx="32" cy="10" r="2.5" fill="#E57D30" opacity="0"/>
        <circle className="cc-pulse" cx="32" cy="32" r="24" fill="none" stroke="#E57D30" strokeWidth="0.5" opacity="0"/>
      </svg>
      <style jsx>{`
        .cc-avatar { animation: ccPulse 3s ease-in-out infinite; }
        .cc-path { animation: ccDraw 3s ease-out infinite; }
        .cc-star-1 { animation: ccStar 3s ease-in-out 0.2s infinite; }
        .cc-star-2 { animation: ccStar 3s ease-in-out 0.5s infinite; }
        .cc-star-3 { animation: ccStar 3s ease-in-out 0.8s infinite; }
        .cc-pulse { animation: ccRing 3s ease-out infinite; }
        @keyframes ccPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes ccDraw { 0%,20% { stroke-dashoffset: 30; } 60%,100% { stroke-dashoffset: 0; } }
        @keyframes ccStar { 0%,30% { opacity: 0; transform: scale(0.5); } 50%,80% { opacity: 0.9; transform: scale(1); } 100% { opacity: 0; } }
        @keyframes ccRing { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.2); opacity: 0; } }
      `}</style>
    </div>
  );
}

export function JobAnalystAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="6" width="36" height="46" rx="4" fill="#F0FDF4" stroke="#059669" strokeWidth="1.2" opacity="0.9"/>
        <rect x="14" y="14" width="24" height="2" rx="1" fill="#1B395D" opacity="0.4"/>
        <rect className="ja-hl-1" x="14" y="20" width="14" height="2.5" rx="1" fill="#059669" opacity="0"/>
        <rect x="30" y="20" width="8" height="2" rx="1" fill="#1B395D" opacity="0.2"/>
        <rect x="14" y="26" width="20" height="2" rx="1" fill="#1B395D" opacity="0.2"/>
        <rect className="ja-hl-2" x="14" y="32" width="18" height="2.5" rx="1" fill="#059669" opacity="0"/>
        <rect x="14" y="38" width="22" height="2" rx="1" fill="#1B395D" opacity="0.15"/>
        <circle className="ja-lens" cx="46" cy="46" r="12" fill="#EFF6FF" stroke="#059669" strokeWidth="1.5" opacity="0"/>
        <circle className="ja-lens-inner" cx="46" cy="46" r="7" fill="none" stroke="#059669" strokeWidth="1.2" opacity="0"/>
        <line className="ja-handle" x1="51" y1="51" x2="56" y2="56" stroke="#059669" strokeWidth="2" strokeLinecap="round" opacity="0"/>
        <rect className="ja-scan" x="8" y="20" width="36" height="1" fill="#059669" opacity="0"/>
      </svg>
      <style jsx>{`
        .ja-hl-1 { animation: jaHL 4s ease-in-out infinite; }
        .ja-hl-2 { animation: jaHL 4s ease-in-out 0.8s infinite; }
        .ja-lens { animation: jaLens 4s ease-in-out infinite; }
        .ja-lens-inner { animation: jaLens 4s ease-in-out 0.1s infinite; }
        .ja-handle { animation: jaLens 4s ease-in-out 0.2s infinite; }
        .ja-scan { animation: jaScan 4s ease-in-out infinite; }
        @keyframes jaHL { 0%,100% { opacity: 0; } 20%,75% { opacity: 0.7; } }
        @keyframes jaLens { 0%,30% { opacity: 0; } 50%,85% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes jaScan { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.4; } 80% { opacity: 0.4; } 100% { transform: translateY(22px); opacity: 0; } }
      `}</style>
    </div>
  );
}

export function JobPostingAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="6" y="14" width="52" height="38" rx="5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" opacity="0.9"/>
        <rect x="12" y="20" width="18" height="3" rx="1.5" fill="#94A3B8" opacity="0.4"/>
        <rect x="12" y="27" width="40" height="1.5" rx="0.75" fill="#94A3B8" opacity="0.2"/>
        <rect x="12" y="31" width="32" height="1.5" rx="0.75" fill="#94A3B8" opacity="0.2"/>
        <rect x="12" y="35" width="36" height="1.5" rx="0.75" fill="#94A3B8" opacity="0.2"/>
        <rect x="12" y="41" width="20" height="5" rx="2.5" fill="#94A3B8" opacity="0.15" stroke="#94A3B8" strokeWidth="0.8"/>
        <path className="jp-lock-body" d="M26 8 C26 5 29 3 32 3 C35 3 38 5 38 8 L38 14 L26 14 Z" fill="#94A3B8" opacity="0.2" stroke="#94A3B8" strokeWidth="1"/>
        <rect className="jp-lock-box" x="22" y="12" width="20" height="16" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" opacity="0.8"/>
        <circle className="jp-keyhole" cx="32" cy="19" r="3" fill="#94A3B8" opacity="0.4"/>
        <rect x="31" y="20" width="2" height="4" rx="1" fill="#94A3B8" opacity="0.4"/>
        <circle className="jp-pulse" cx="32" cy="19" r="7" fill="none" stroke="#94A3B8" strokeWidth="0.5" opacity="0"/>
      </svg>
      <style jsx>{`
        .jp-lock-body { animation: jpFloat 3s ease-in-out infinite; }
        .jp-lock-box { animation: jpFloat 3s ease-in-out infinite; }
        .jp-keyhole { animation: jpPulse 3s ease-in-out infinite; }
        .jp-pulse { animation: jpRing 3s ease-out infinite; }
        @keyframes jpFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes jpPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes jpRing { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.8); opacity: 0; } }
      `}</style>
    </div>
  );
}
