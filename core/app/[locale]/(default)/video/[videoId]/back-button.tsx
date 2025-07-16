'use client';

export function BackButton() {
  return (
    <button
      className="inline-flex items-center rounded-lg px-4 py-2 font-[Futura] text-white transition-colors"
      onClick={() => window.close()}
      style={{ backgroundColor: '#ed1c24' }}
    >
      ← Close Video
    </button>
  );
} 