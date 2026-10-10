import React, { useEffect } from 'react';
import type { ScoreboardState } from '../types/scoreboard';
import { RollingNumber } from './RollingNumber';
import { Minimize2 } from 'lucide-react';

interface ObsOverlayProps {
  state: ScoreboardState;
  onExit: () => void;
  formatTime: (seconds: number) => string;
}

export const ObsOverlay: React.FC<ObsOverlayProps> = ({
  state,
  onExit,
  formatTime,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end p-4 sm:p-8 select-none overflow-hidden"
      style={{ backgroundColor: state.chromaColor || '#00FF00' }}
    >
      {/* Floating Exit Button (hidden on stream if positioned outside, or hover visible) */}
      <button
        onClick={onExit}
        type="button"
        title="Exit OBS Mode (ESC)"
        aria-label="Exit OBS Broadcast Mode"
        className="absolute top-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-mono backdrop-blur-md border border-white/20 shadow-xl"
      >
        <Minimize2 aria-hidden="true" className="w-4 h-4 text-[#AEEED3]" />
        <span>Exit OBS (Esc)</span>
      </button>

      {/* Broadcast Lower-Third Banner */}
      <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl bg-slate-950/95 text-white transition-all transform animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-stretch h-20 sm:h-24">
          
          {/* Team A Zone */}
          <div className="flex-1 flex items-center justify-between px-4 sm:px-6 relative overflow-hidden">
            {/* Team A accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-2.5 sm:w-3"
              style={{ backgroundColor: state.teamA.color || '#287A74' }}
            />

            <div className="flex items-center gap-3 sm:gap-4 ml-2 min-w-0">
              {state.teamA.logo ? (
                <img
                  src={state.teamA.logo}
                  alt={`${state.teamA.name} logo`}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-lg flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black font-stadium text-lg flex-shrink-0"
                  style={{
                    backgroundColor: `${state.teamA.color || '#287A74'}30`,
                    color: state.teamA.color || '#287A74',
                  }}
                >
                  {state.teamA.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <span className="font-extrabold text-base sm:text-2xl font-stadium truncate tracking-wide uppercase">
                {state.teamA.name}
              </span>
            </div>

            <div className="flex items-center">
              <RollingNumber
                value={state.teamA.score}
                className="text-4xl sm:text-6xl font-black font-stadium text-white px-2"
                glowColor={state.teamA.color}
              />
            </div>
          </div>

          {/* Central Match Info / Period / Clock */}
          <div className="w-24 sm:w-32 bg-slate-900/90 border-x border-white/10 flex flex-col items-center justify-center px-2 py-1 text-center flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-[#AEEED3]">
              {state.periodType.toUpperCase()} {state.period}
            </span>

            {state.timerSeconds > 0 || state.timerRunning ? (
              <span className="font-mono text-xs sm:text-sm font-black text-[#FFF8B0] tracking-wider mt-0.5">
                {formatTime(state.timerSeconds)}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                LIVE
              </span>
            )}
          </div>

          {/* Team B Zone */}
          <div className="flex-1 flex items-center justify-between px-4 sm:px-6 relative overflow-hidden flex-row-reverse">
            {/* Team B accent bar */}
            <div
              className="absolute right-0 top-0 bottom-0 w-2.5 sm:w-3"
              style={{ backgroundColor: state.teamB.color || '#55A9A0' }}
            />

            <div className="flex items-center gap-3 sm:gap-4 mr-2 min-w-0 flex-row-reverse">
              {state.teamB.logo ? (
                <img
                  src={state.teamB.logo}
                  alt={`${state.teamB.name} logo`}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-lg flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-black font-stadium text-lg flex-shrink-0"
                  style={{
                    backgroundColor: `${state.teamB.color || '#55A9A0'}30`,
                    color: state.teamB.color || '#55A9A0',
                  }}
                >
                  {state.teamB.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <span className="font-extrabold text-base sm:text-2xl font-stadium truncate tracking-wide uppercase">
                {state.teamB.name}
              </span>
            </div>

            <div className="flex items-center">
              <RollingNumber
                value={state.teamB.score}
                className="text-4xl sm:text-6xl font-black font-stadium text-white px-2"
                glowColor={state.teamB.color}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ObsOverlay;
