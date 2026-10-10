import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  ArrowLeftRight,
  Settings,
  Tv,
  Share2,
  Check,
  Play,
  Pause,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Trophy,
  Bookmark,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  INITIAL_SCOREBOARD_STATE,
  type ScoreboardState,
} from '../types/scoreboard';
import {
  translations,
  type LanguageCode,
  type TranslationStrings,
} from '../i18n/translations';
import { RollingNumber } from './RollingNumber';
import { SettingsModal } from './SettingsModal';
import { SavedBoardsModal } from './SavedBoardsModal';
import { ObsOverlay } from './ObsOverlay';
import { playScoreSound, playBuzzerSound } from '../utils/audio';
import {
  decodeStateFromHash,
  updateUrlHashSilently,
} from '../utils/stateSync';
import {
  loadActiveBoardState,
  saveActiveBoardState,
  getSavedTeams,
  type SavedTeamProfile,
} from '../utils/storage';

export const Scoreboard: React.FC = () => {
  const [state, setState] = useState<ScoreboardState>(INITIAL_SCOREBOARD_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavedBoardsOpen, setIsSavedBoardsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const t: TranslationStrings = translations[lang] || translations.en;

  // Hydrate initial state from URL Hash (#data=...) or LocalStorage
  useEffect(() => {
    const hydrateFromHashOrStorage = () => {
      const fromHash = decodeStateFromHash(window.location.hash);
      if (fromHash) {
        // Attempt to match team logos from local saved roster if omitted from compact URL
        const savedTeams = getSavedTeams();
        const teamALogo =
          fromHash.teamA?.logo ||
          savedTeams.find((st) => st.name.toUpperCase() === fromHash.teamA?.name?.toUpperCase())?.logo;
        const teamBLogo =
          fromHash.teamB?.logo ||
          savedTeams.find((st) => st.name.toUpperCase() === fromHash.teamB?.name?.toUpperCase())?.logo;

        setState((prev) => ({
          ...prev,
          ...fromHash,
          teamA: {
            ...prev.teamA,
            ...fromHash.teamA,
            logo: teamALogo,
          },
          teamB: {
            ...prev.teamB,
            ...fromHash.teamB,
            logo: teamBLogo,
          },
        }));
        setIsHydrated(true);
        return;
      }

      const fromStorage = loadActiveBoardState();
      if (fromStorage) {
        setState((prev) => ({
          ...prev,
          ...fromStorage,
          timerRunning: false,
          teamA: { ...prev.teamA, ...fromStorage.teamA },
          teamB: { ...prev.teamB, ...fromStorage.teamB },
        }));
      }
      setIsHydrated(true);
    };

    hydrateFromHashOrStorage();

    const handleHashChange = () => {
      const fromHash = decodeStateFromHash(window.location.hash);
      if (fromHash) {
        setState((prev) => ({
          ...prev,
          ...fromHash,
          teamA: { ...prev.teamA, ...fromHash.teamA },
          teamB: { ...prev.teamB, ...fromHash.teamB },
        }));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Automatically sync state changes to URL Hash (#data=...) and LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    saveActiveBoardState(state);
    updateUrlHashSilently(state);
  }, [state, isHydrated]);

  // Listen to language changes from Navbar LanguageSelector
  useEffect(() => {
    const savedLang = localStorage.getItem('matchboard_lang') as LanguageCode;
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: LanguageCode }>;
      if (customEvent.detail?.lang) {
        setLang(customEvent.detail.lang);
      }
    };

    window.addEventListener('matchboard:lang-change', handleLangChange);
    return () => window.removeEventListener('matchboard:lang-change', handleLangChange);
  }, []);

  // Match timer interval
  useEffect(() => {
    if (!state.timerRunning) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.timerDirection === 'down') {
          if (prev.timerSeconds <= 1) {
            if (prev.soundEnabled) playBuzzerSound();
            return { ...prev, timerSeconds: 0, timerRunning: false };
          }
          return { ...prev, timerSeconds: prev.timerSeconds - 1 };
        }
        return { ...prev, timerSeconds: prev.timerSeconds + 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timerRunning]);

  // Score update handler
  const updateScore = useCallback((team: 'A' | 'B', delta: number) => {
    setState((prev) => {
      const targetKey = team === 'A' ? 'teamA' : 'teamB';
      const currentScore = prev[targetKey].score;
      const nextScore = Math.max(0, currentScore + delta);

      if (nextScore !== currentScore && prev.soundEnabled) {
        playScoreSound(delta > 0);
      }

      return {
        ...prev,
        [targetKey]: {
          ...prev[targetKey],
          score: nextScore,
        },
      };
    });
  }, []);

  // Keyboard shortcuts for fast refereeing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'q' || e.key === 'Q') {
        updateScore('A', 1);
      } else if (e.key === 'a' || e.key === 'A') {
        updateScore('A', -1);
      } else if (e.key === 'p' || e.key === 'P') {
        updateScore('B', 1);
      } else if (e.key === 'l' || e.key === 'L') {
        updateScore('B', -1);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setState((prev) => ({ ...prev, timerRunning: !prev.timerRunning }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [updateScore]);

  // Swap Team A and Team B
  const handleSwapSides = () => {
    if (state.soundEnabled) playScoreSound(true);
    setState((prev) => ({
      ...prev,
      teamA: { ...prev.teamB },
      teamB: { ...prev.teamA },
    }));
  };

  // Reset scores & timer
  const handleResetScores = () => {
    if (state.soundEnabled) playBuzzerSound();
    setState((prev) => ({
      ...prev,
      teamA: { ...prev.teamA, score: 0 },
      teamB: { ...prev.teamB, score: 0 },
      period: 1,
      timerSeconds: 0,
      timerRunning: false,
    }));
  };

  // Celebrate Victory Confetti
  const handleCelebrate = () => {
    if (state.soundEnabled) playBuzzerSound();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: [
        state.teamA.color || '#287A74',
        state.teamB.color || '#55A9A0',
        '#AEEED3',
        '#FFF8B0',
      ],
    });
  };

  // Copy Live Link with compressed state
  const handleCopyLink = async () => {
    try {
      const liveUrl = updateUrlHashSilently(state) || window.location.href;
      await navigator.clipboard.writeText(liveUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (_) {}
  };

  // Load a saved board preset from LocalStorage
  const handleLoadSavedBoard = (newState: ScoreboardState) => {
    setState(newState);
    updateUrlHashSilently(newState);
    saveActiveBoardState(newState);
  };

  // Assign team roster profile to slot A or B
  const handleAssignTeam = (slot: 'A' | 'B', profile: SavedTeamProfile) => {
    setState((prev) => ({
      ...prev,
      [slot === 'A' ? 'teamA' : 'teamB']: {
        ...prev[slot === 'A' ? 'teamA' : 'teamB'],
        name: profile.name,
        color: profile.color,
        logo: profile.logo,
      },
    }));
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // If OBS Broadcast Mode is active, render pure Chroma-Key Lower Third Overlay
  if (state.isObsMode) {
    return (
      <>
        {state.customCss && <style id="matchboard-custom-css">{state.customCss}</style>}
        <ObsOverlay
          state={state}
          onExit={() => setState((prev) => ({ ...prev, isObsMode: false }))}
          formatTime={formatTime}
        />
      </>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-3 sm:gap-4 px-2 sm:px-4 lg:px-6 py-2 sm:py-4 select-none">
      {/* Inject User Custom CSS if present */}
      {state.customCss && <style id="matchboard-custom-css">{state.customCss}</style>}

      {/* TOP CONTROL BAR: Period Indicator, Match Clock & Quick Broadcast Controls */}
      <div className="w-full glass-panel rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: Period / Set Control */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-[#0B0F12] rounded-xl p-1 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, period: Math.max(1, prev.period - 1) }))
              }
              aria-label="Decrease period"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="px-2.5 sm:px-3 text-center min-w-[78px]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block leading-none">
                {t[state.periodType]}
              </span>
              <span className="font-stadium font-extrabold text-sm sm:text-base text-[#287A74] dark:text-[#AEEED3]">
                {state.period}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, period: prev.period + 1 }))}
              aria-label="Increase period"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Match Timer */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0B0F12] rounded-xl px-2.5 py-1 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, timerRunning: !prev.timerRunning }))
              }
              aria-label={state.timerRunning ? 'Pause timer' : 'Start timer'}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                state.timerRunning
                  ? 'bg-[#FFF8B0] text-[#287A74] dark:bg-[#AEEED3] dark:text-[#0B0F12]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {state.timerRunning ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            <span className="font-mono font-bold text-sm sm:text-base tabular-nums px-1 text-slate-800 dark:text-slate-100">
              {formatTime(state.timerSeconds)}
            </span>

            {state.timerSeconds > 0 && (
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    timerSeconds: 0,
                    timerRunning: false,
                  }))
                }
                title="Reset Clock"
                aria-label="Reset match clock"
                className="text-[10px] font-mono text-slate-400 hover:text-red-500 px-1"
              >
                00:00
              </button>
            )}
          </div>
        </div>

        {/* Right: Utility & Pro Feature Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={() =>
              setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
            }
            title={state.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            aria-label={state.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#131A20] text-slate-600 dark:text-slate-300 hover:border-[#55A9A0] dark:hover:border-[#AEEED3]/50 transition-all"
          >
            {state.soundEnabled ? (
              <Volume2 aria-hidden="true" className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
            ) : (
              <VolumeX aria-hidden="true" className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Swap Sides */}
          <button
            type="button"
            onClick={handleSwapSides}
            title={t.swap}
            aria-label={t.swap}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#131A20] text-slate-700 dark:text-slate-200 hover:border-[#55A9A0] dark:hover:border-[#AEEED3]/50 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowLeftRight aria-hidden="true" className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
            <span className="hidden xl:inline">{t.swap}</span>
          </button>

          {/* Celebrate / Confetti */}
          <button
            type="button"
            onClick={handleCelebrate}
            title="Match Winner Confetti"
            aria-label="Celebrate Match Winner with Confetti"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#131A20] text-slate-700 dark:text-slate-200 hover:border-[#55A9A0] dark:hover:border-[#AEEED3]/50 transition-all active:scale-95"
          >
            <Trophy aria-hidden="true" className="w-4 h-4 text-amber-500 dark:text-[#FFF8B0]" />
          </button>

          {/* Reset Scores */}
          <button
            type="button"
            onClick={handleResetScores}
            title={t.reset}
            aria-label={t.reset}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#131A20] text-slate-700 dark:text-slate-200 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold transition-all active:scale-95"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            <span className="hidden xl:inline">{t.reset}</span>
          </button>

          {/* OBS Broadcast Overlay Mode */}
          <button
            type="button"
            onClick={() => setState((prev) => ({ ...prev, isObsMode: true }))}
            title={t.obsMode}
            aria-label={t.obsMode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#287A74]/30 dark:border-[#AEEED3]/30 bg-[#FFF8B0]/60 dark:bg-[#AEEED3]/10 text-[#287A74] dark:text-[#AEEED3] hover:bg-[#FFF8B0] dark:hover:bg-[#AEEED3]/20 text-xs font-bold transition-all active:scale-95"
          >
            <Tv aria-hidden="true" className="w-4 h-4" />
            <span className="hidden md:inline">OBS Mode</span>
          </button>

          {/* Saved Boards & Teams Manager Button */}
          <button
            type="button"
            onClick={() => setIsSavedBoardsOpen(true)}
            title={t.savedBoards}
            aria-label={t.savedBoards}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131A20] text-slate-800 dark:text-slate-100 hover:border-[#287A74] dark:hover:border-[#AEEED3] text-xs font-bold transition-all active:scale-95"
          >
            <Bookmark aria-hidden="true" className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
            <span className="hidden lg:inline">{t.savedBoards}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title={t.settings}
            aria-label={t.settings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131A20] text-slate-800 dark:text-slate-100 hover:border-[#287A74] dark:hover:border-[#AEEED3] text-xs font-bold transition-all active:scale-95"
          >
            <Settings aria-hidden="true" className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
            <span className="hidden lg:inline">{t.settings}</span>
          </button>

          {/* Copy Live Link CTA */}
          <button
            type="button"
            onClick={handleCopyLink}
            title={t.copyLink}
            aria-label={copiedLink ? t.linkCopied : t.copyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#287A74] hover:bg-[#55A9A0] text-white dark:bg-[#AEEED3] dark:text-[#0B0F12] dark:hover:bg-[#55A9A0] dark:hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            {copiedLink ? (
              <>
                <Check aria-hidden="true" className="w-4 h-4" />
                <span className="hidden sm:inline">{t.linkCopied}</span>
              </>
            ) : (
              <>
                <Share2 aria-hidden="true" className="w-4 h-4" />
                <span className="hidden sm:inline">{t.copyLink}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MAIN SCOREBOARD GRID: Massive Touch Targets (>= 60% viewport height) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 w-full min-h-[64vh] sm:min-h-[68vh]">
        {(['A', 'B'] as const).map((teamKey) => {
          const team = teamKey === 'A' ? state.teamA : state.teamB;
          const accentColor = team.color || (teamKey === 'A' ? '#287A74' : '#55A9A0');

          return (
            <div
              key={teamKey}
              className="scoreboard-card group relative flex flex-col rounded-3xl overflow-hidden border-2 transition-all duration-300 shadow-luxury dark:shadow-2xl bg-white dark:bg-[#131A20]"
              style={{
                borderColor: `${accentColor}45`,
              }}
            >
              {/* Top Team Color Bar */}
              <div
                className="h-2.5 w-full transition-colors duration-300"
                style={{ backgroundColor: accentColor }}
              />

              {/* Team Header Bar (Editable Name, Logo & Quick +2/+3 Modifiers) */}
              <div className="relative z-20 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0B0F12]/40">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      onClick={() => setIsSettingsOpen(true)}
                      title="Click to edit team logo"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      title="Upload Team Logo or Change Color"
                      aria-label={`Upload logo or change color for ${team.name}`}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-stadium font-black text-sm sm:text-base transition-transform hover:scale-105 flex-shrink-0"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        color: accentColor,
                        border: `1px solid ${accentColor}40`,
                      }}
                    >
                      {team.name.slice(0, 2).toUpperCase() || teamKey}
                    </button>
                  )}

                  <input
                    type="text"
                    value={team.name}
                    maxLength={22}
                    aria-label={`Edit ${teamKey === 'A' ? 'Team A' : 'Team B'} name`}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        [teamKey === 'A' ? 'teamA' : 'teamB']: {
                          ...prev[teamKey === 'A' ? 'teamA' : 'teamB'],
                          name: e.target.value,
                        },
                      }))
                    }
                    className="team-title w-full bg-transparent font-stadium font-extrabold text-lg sm:text-2xl lg:text-3xl tracking-wide uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#55A9A0]/50 rounded-lg px-1.5 py-0.5 truncate"
                  />
                </div>

                {/* Quick Multi-Point Pills (+2, +3) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => updateScore(teamKey, 2)}
                    aria-label={`Add 2 points to ${team.name}`}
                    className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-slate-200/70 hover:bg-[#FFF8B0] text-slate-700 hover:text-[#287A74] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#AEEED3]/20 dark:hover:text-[#AEEED3] transition-colors active:scale-90"
                  >
                    +2
                  </button>
                  <button
                    type="button"
                    onClick={() => updateScore(teamKey, 3)}
                    aria-label={`Add 3 points to ${team.name}`}
                    className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-slate-200/70 hover:bg-[#FFF8B0] text-slate-700 hover:text-[#287A74] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#AEEED3]/20 dark:hover:text-[#AEEED3] transition-colors active:scale-90"
                  >
                    +3
                  </button>
                </div>
              </div>

              {/* MASSIVE SPLIT TOUCH ZONE AREA (>= 50% Viewport Height) */}
              <div className="relative flex-1 flex flex-col min-h-[280px] sm:min-h-[380px] lg:min-h-[440px]">
                {/* Ambient team glow in background */}
                <div
                  className="
                    pointer-events-none absolute inset-0 opacity-10 dark:opacity-15 transition-all duration-500
                  "
                  style={{
                    background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)`,
                  }}
                />

                {/* UPPER 50% TAP TARGET: INCREMENT (+1) */}
                <button
                  type="button"
                  onClick={() => updateScore(teamKey, 1)}
                  aria-label={`Add 1 point to ${team.name}`}
                  className="group/top relative z-10 flex-1 w-full flex items-start justify-between p-4 sm:p-6 text-left transition-colors hover:bg-emerald-500/[0.04] active:bg-emerald-500/[0.12] focus:outline-none"
                >
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 group-hover/top:bg-[#287A74] group-hover/top:text-white dark:group-hover/top:bg-[#AEEED3] dark:group-hover/top:text-[#0B0F12] transition-all">
                    <Plus className="w-3 h-3" /> 1 PT
                  </span>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 opacity-0 group-hover/top:opacity-100 transition-opacity">
                    Tap Upper Half (+1)
                  </span>
                </button>

                {/* Subtle Horizontal Equator Divider */}
                <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent pointer-events-none" />

                {/* LOWER 50% TAP TARGET: DECREMENT (-1) */}
                <button
                  type="button"
                  onClick={() => updateScore(teamKey, -1)}
                  aria-label={`Subtract 1 point from ${team.name}`}
                  className="group/bottom relative z-10 flex-1 w-full flex items-end justify-between p-4 sm:p-6 text-left transition-colors hover:bg-rose-500/[0.04] active:bg-rose-500/[0.12] focus:outline-none"
                >
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 group-hover/bottom:bg-rose-600 group-hover/bottom:text-white transition-all">
                    <Minus className="w-3 h-3" /> 1 PT
                  </span>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 opacity-0 group-hover/bottom:opacity-100 transition-opacity">
                    Tap Lower Half (-1)
                  </span>
                </button>

                {/* CENTER OVERLAY: MASSIVE ROLLING SCORE NUMBER (Pointer-events-none so taps pass cleanly to upper/lower halves) */}
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                  <RollingNumber
                    value={team.score}
                    glowColor={accentColor}
                    className="score-digit text-[7.5rem] sm:text-[10.5rem] lg:text-[13.5rem] font-black text-slate-900 dark:text-white drop-shadow-sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Helper Hint Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
        <span>💡 {t.instructionsTap}</span>
        <span className="hidden md:inline">
          Shortcuts: [Q/A] Team A ±1 • [P/L] Team B ±1 • [Space] Timer
        </span>
      </div>

      {/* Pro Features & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onChange={setState}
        t={t}
      />

      {/* Unlimited Saved Boards & Teams Roster Modal */}
      <SavedBoardsModal
        isOpen={isSavedBoardsOpen}
        onClose={() => setIsSavedBoardsOpen(false)}
        state={state}
        onLoadState={handleLoadSavedBoard}
        onAssignTeam={handleAssignTeam}
        t={t}
      />
    </div>
  );
};

export default Scoreboard;
