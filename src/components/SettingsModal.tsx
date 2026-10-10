import React, { useState } from 'react';
import {
  X,
  Upload,
  Trash2,
  Palette,
  Code2,
  Tv,
  Volume2,
  VolumeX,
  Check,
  Sparkles,
} from 'lucide-react';
import type { ScoreboardState, PeriodType } from '../types/scoreboard';
import { downscaleLogoImage } from '../utils/imageCompressor';
import type { TranslationStrings } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ScoreboardState;
  onChange: (updater: (prev: ScoreboardState) => ScoreboardState) => void;
  t: TranslationStrings;
}

const PRESET_COLORS = [
  '#287A74', // Deep Teal
  '#55A9A0', // Muted Teal
  '#10B981', // Emerald
  '#3B82F6', // Royal Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#EF4444', // Crimson Red
  '#F97316', // Orange
  '#EAB308', // Gold
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onChange,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'broadcast' | 'css'>('teams');
  const [uploadingTeam, setUploadingTeam] = useState<'A' | 'B' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogoUpload = async (team: 'A' | 'B', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTeam(team);
    setErrorMsg(null);
    try {
      const compressedBase64 = await downscaleLogoImage(file, 128);
      onChange((prev) => ({
        ...prev,
        [team === 'A' ? 'teamA' : 'teamB']: {
          ...prev[team === 'A' ? 'teamA' : 'teamB'],
          logo: compressedBase64,
        },
      }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setUploadingTeam(null);
      e.target.value = '';
    }
  };

  const removeLogo = (team: 'A' | 'B') => {
    onChange((prev) => ({
      ...prev,
      [team === 'A' ? 'teamA' : 'teamB']: {
        ...prev[team === 'A' ? 'teamA' : 'teamB'],
        logo: undefined,
      },
    }));
  };

  const updateTeamColor = (team: 'A' | 'B', color: string) => {
    onChange((prev) => ({
      ...prev,
      [team === 'A' ? 'teamA' : 'teamB']: {
        ...prev[team === 'A' ? 'teamA' : 'teamB'],
        color,
      },
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#131A20] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#287A74]/10 dark:bg-[#AEEED3]/10 flex items-center justify-center text-[#287A74] dark:text-[#AEEED3]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {t.settings}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% Unlocked Pro Broadcast Features
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-[#0B0F12]/60 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'teams'
                ? 'border-[#287A74] dark:border-[#AEEED3] text-[#287A74] dark:text-[#AEEED3] bg-white dark:bg-[#131A20]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t.customColors} & Logos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'broadcast'
                ? 'border-[#287A74] dark:border-[#AEEED3] text-[#287A74] dark:text-[#AEEED3] bg-white dark:bg-[#131A20]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Match & OBS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('css')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'css'
                ? 'border-[#287A74] dark:border-[#AEEED3] text-[#287A74] dark:text-[#AEEED3] bg-white dark:bg-[#131A20]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.customCss}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: TEAMS & LOGOS */}
          {activeTab === 'teams' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(['A', 'B'] as const).map((teamKey) => {
                const team = teamKey === 'A' ? state.teamA : state.teamB;
                return (
                  <div
                    key={teamKey}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F12]/50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
                        {teamKey === 'A' ? t.teamA : t.teamB}
                      </span>
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: team.color || '#287A74' }}
                      />
                    </div>

                    {/* Team Name Input */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        maxLength={24}
                        value={team.name}
                        onChange={(e) =>
                          onChange((prev) => ({
                            ...prev,
                            [teamKey === 'A' ? 'teamA' : 'teamB']: {
                              ...prev[teamKey === 'A' ? 'teamA' : 'teamB'],
                              name: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#131A20] border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#287A74] dark:focus:border-[#AEEED3]"
                      />
                    </div>

                    {/* Team Color Picker */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Team Hex Color
                      </label>
                      <div className="flex items-center gap-2 mb-2.5">
                        <input
                          type="color"
                          value={team.color || '#287A74'}
                          onChange={(e) => updateTeamColor(teamKey, e.target.value)}
                          className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input
                          type="text"
                          value={team.color || '#287A74'}
                          onChange={(e) => updateTeamColor(teamKey, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131A20] border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      {/* Swatches */}
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => updateTeamColor(teamKey, hex)}
                            aria-label={`Select color ${hex} for ${team.name}`}
                            className="w-6 h-6 rounded-md border border-black/10 dark:border-white/10 flex items-center justify-center transition-transform hover:scale-110"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          >
                            {team.color?.toLowerCase() === hex.toLowerCase() && (
                              <Check aria-hidden="true" className="w-3.5 h-3.5 text-white drop-shadow" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        {t.uploadLogo} (SVG/PNG)
                      </label>

                      {team.logo ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#131A20] border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <img
                              src={team.logo}
                              alt={`${team.name} logo`}
                              width={40}
                              height={40}
                              loading="lazy"
                              decoding="async"
                              className="w-10 h-10 object-contain rounded-lg bg-slate-100 dark:bg-slate-900 p-1"
                            />
                            <span className="text-xs font-medium text-emerald-600 dark:text-[#AEEED3]">
                              Logo Active
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLogo(teamKey)}
                            aria-label={`${t.removeLogo} for ${team.name}`}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title={t.removeLogo}
                          >
                            <Trash2 aria-hidden="true" className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#287A74] dark:hover:border-[#AEEED3] cursor-pointer transition-colors text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-[#131A20]/50">
                          <Upload className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
                          <span>
                            {uploadingTeam === teamKey ? 'Compressing...' : t.uploadLogo}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            className="hidden"
                            onChange={(e) => handleLogoUpload(teamKey, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: BROADCAST & MATCH SETTINGS */}
          {activeTab === 'broadcast' && (
            <div className="space-y-5">
              {/* Period Nomenclature */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F12]/50">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3">
                  Period / Set Indicator Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['period', 'set', 'quarter', 'half'] as PeriodType[]).map((pType) => (
                    <button
                      key={pType}
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, periodType: pType }))}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                        state.periodType === pType
                          ? 'bg-[#287A74] text-white border-[#287A74] dark:bg-[#AEEED3] dark:text-[#0B0F12] dark:border-[#AEEED3]'
                          : 'bg-white dark:bg-[#131A20] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#55A9A0]'
                      }`}
                    >
                      {t[pType]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Feedback */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F12]/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Stadium Audio Synthesizer
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Play Web Audio acoustic feedback when scores update or buzzers trigger
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    state.soundEnabled
                      ? 'bg-[#287A74] text-white dark:bg-[#AEEED3] dark:text-[#0B0F12]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{state.soundEnabled ? 'ON' : 'MUTED'}</span>
                </button>
              </div>

              {/* OBS Chroma Key Background */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F12]/50 space-y-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    OBS Broadcast Chroma-Key Color
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pure `#00FF00` green is standard for OBS Studio Color Key / Chroma Key filters.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { label: 'Chroma Green (#00FF00)', hex: '#00FF00' },
                    { label: 'Chroma Blue (#0000FF)', hex: '#0000FF' },
                    { label: 'Chroma Magenta (#FF00FF)', hex: '#FF00FF' },
                    { label: 'Studio Black (#000000)', hex: '#000000' },
                  ].map((item) => (
                    <button
                      key={item.hex}
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, chromaColor: item.hex }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                        state.chromaColor === item.hex
                          ? 'border-[#287A74] dark:border-[#AEEED3] bg-[#287A74]/10 dark:bg-[#AEEED3]/10 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131A20]'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCED CUSTOM CSS */}
          {activeTab === 'css' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F12]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Live CSS Override Injector
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Target `.scoreboard-card`, `.score-digit`, or `.team-title` to customize broadcast appearance.
                    </p>
                  </div>
                  {state.customCss && (
                    <button
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, customCss: '' }))}
                      className="text-xs text-red-500 hover:underline font-medium"
                    >
                      Clear CSS
                    </button>
                  )}
                </div>

                <textarea
                  rows={6}
                  value={state.customCss}
                  onChange={(e) => onChange((prev) => ({ ...prev, customCss: e.target.value }))}
                  placeholder={`/* Example Custom Broadcast Overrides */\n.score-digit {\n  letter-spacing: -0.04em;\n}\n.scoreboard-card {\n  border-radius: 2rem;\n}`}
                  className="w-full p-3.5 rounded-xl font-mono text-xs bg-slate-900 text-[#AEEED3] border border-slate-700 focus:outline-none focus:border-[#AEEED3]"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        customCss: `.score-digit { text-shadow: 0 0 35px #AEEED3 !important; }\n.scoreboard-card { border-width: 3px !important; }`,
                      }))
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:bg-[#FFF8B0] dark:hover:bg-[#287A74]/40 transition-colors"
                  >
                    + Neon Stadium Preset
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        customCss: `.scoreboard-card { border-radius: 0px !important; }\n.team-title { font-style: italic; }`,
                      }))
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:bg-[#FFF8B0] dark:hover:bg-[#287A74]/40 transition-colors"
                  >
                    + Sharp Esports Preset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#287A74] text-white hover:bg-[#55A9A0] dark:bg-[#AEEED3] dark:text-[#0B0F12] dark:hover:bg-[#55A9A0] dark:hover:text-white transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
