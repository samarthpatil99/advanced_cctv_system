import React from 'react';

interface VirtualCursorProps {
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
  label?: string;
}

export const VirtualCursor: React.FC<VirtualCursorProps> = ({
  x,
  y,
  visible,
  clicking,
  label = 'AUTOPILOT',
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-all duration-700 ease-out"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        left: 0,
        top: 0,
      }}
    >
      {/* Click Ripple Wave */}
      {clicking && (
        <span className="absolute -left-4 -top-4 w-12 h-12 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-ping opacity-90" />
      )}

      {/* Cursor Body */}
      <div className="relative flex items-center">
        {/* Glowing Cursor SVG */}
        <svg
          className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] filter"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="#0f172a"
          strokeWidth="1.5"
        >
          <path d="M4 2l16 12-8.5 1.5L7 22z" />
        </svg>

        {/* Small Presenter Badge */}
        <div className="ml-1 px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/80 text-[10px] font-mono font-bold text-cyan-300 shadow-md whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  );
};
