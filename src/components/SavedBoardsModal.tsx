import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  Users,
  Download,
  Upload,
  Trash2,
  FolderOpen,
  Plus,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { ScoreboardState } from '../types/scoreboard';
import type { TranslationStrings } from '../i18n/translations';
import {
  getSavedBoards,
  saveBoardToStorage,
  deleteSavedBoard,
  getSavedTeams,
  saveTeamProfile,
  deleteSavedTeam,
  exportAllDataAsJson,
  importDataFromJson,
  type SavedBoardEntry,
  type SavedTeamProfile,
} from '../utils/storage';
import { downscaleLogoImage } from '../utils/imageCompressor';

interface SavedBoardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ScoreboardState;
  onLoadState: (newState: ScoreboardState) => void;
  onAssignTeam: (slot: 'A' | 'B', profile: SavedTeamProfile) => void;
  t: TranslationStrings;
}

export const SavedBoardsModal: React.FC<SavedBoardsModalProps> = ({
  isOpen,
  onClose,
  state,
  onLoadState,
  onAssignTeam,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'boards' | 'teams' | 'backup'>('boards');
  const [boards, setBoards] = useState<SavedBoardEntry[]>([]);
  const [teams, setTeams] = useState<SavedTeamProfile[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#287A74');
  const [newTeamLogo, setNewTeamLogo] = useState<string | undefined>(undefined);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBoards(getSavedBoards());
      setTeams(getSavedTeams());
      setErrorMsg(null);
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  // --- Board Handlers ---
  const handleSaveCurrentBoard = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = saveBoardToStorage(state, customTitle);
      setBoards(updated);
      setCustomTitle('');
      showToast('Match saved to browser storage!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save match.');
    }
  };

  const handleOverwriteBoard = (id: string, existingTitle: string) => {
    try {
      const updated = saveBoardToStorage(state, existingTitle, id);
      setBoards(updated);
      showToast('Saved match updated!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update match.');
    }
  };

  const handleDeleteBoard = (id: string) => {
    setBoards(deleteSavedBoard(id));
  };

  // --- Team Roster Handlers ---
  const handleSaveActiveTeam = (slot: 'A' | 'B') => {
    try {
      const teamData = slot === 'A' ? state.teamA : state.teamB;
      const updated = saveTeamProfile(teamData);
      setTeams(updated);
      showToast(`Saved "${teamData.name}" to Team Roster!`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save team.');
    }
  };

  const handleCreateCustomTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      const updated = saveTeamProfile({
        name: newTeamName.trim(),
        score: 0,
        color: newTeamColor,
        logo: newTeamLogo,
      });
      setTeams(updated);
      setNewTeamName('');
      setNewTeamLogo(undefined);
      showToast('New team added to roster!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create team.');
    }
  };

  const handleNewTeamLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await downscaleLogoImage(file, 128);
      setNewTeamLogo(compressed);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process logo.');
    } finally {
      e.target.value = '';
    }
  };

  // --- Backup Export/Import ---
  const handleExportJson = () => {
    const json = exportAllDataAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matchboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        const result = importDataFromJson(content);
        setBoards(result.boards);
        setTeams(result.teams);
        showToast(`Imported ${result.boards.length} boards & ${result.teams.length} teams!`);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Invalid backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-boards-modal-title"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#131A20] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#287A74]/10 dark:bg-[#AEEED3]/10 flex items-center justify-center text-[#287A74] dark:text-[#AEEED3]">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 id="saved-boards-modal-title" className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {t.savedBoards} & Team Rosters
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% Zero-Server LocalStorage • Unlimited Saved Games & Teams
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
            onClick={() => setActiveTab('boards')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'boards'
                ? 'border-[#287A74] dark:border-[#AEEED3] text-[#287A74] dark:text-[#AEEED3] bg-white dark:bg-[#131A20]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Matches ({boards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'teams'
                ? 'border-[#287A74] dark:border-[#AEEED3] text-[#287A74] dark:text-[#AEEED3] bg-white dark:bg-[#131A20]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Saved Teams ({teams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-[#287A74] dark:border-[#AEEED3] text-[#287A74] dark:text-[#AEEED3] bg-white dark:bg-[#131A20]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-[#AEEED3] text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: SAVED MATCHES */}
          {activeTab === 'boards' && (
            <div className="space-y-5">
              {/* Save Current Match Form */}
              <form
                onSubmit={handleSaveCurrentBoard}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0B0F12]/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`${state.teamA.name} vs ${state.teamB.name} (Optional Label)`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131A20] border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#287A74] dark:focus:border-[#AEEED3]"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#287A74] hover:bg-[#55A9A0] text-white dark:bg-[#AEEED3] dark:text-[#0B0F12] dark:hover:bg-[#55A9A0] dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.saveCurrent}</span>
                </button>
              </form>

              {/* Saved Boards List */}
              {boards.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No saved scoreboards yet
                  </p>
                  <p className="text-xs mt-1">
                    Save your current game above to build your offline match history.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {boards.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F12]/80 hover:border-[#55A9A0] dark:hover:border-[#AEEED3]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {entry.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {entry.state.periodType.toUpperCase()} {entry.state.period}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-stadium font-bold">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: entry.state.teamA.color || '#287A74' }}
                            />
                            <span>{entry.state.teamA.name}:</span>
                            <span className="text-[#287A74] dark:text-[#AEEED3]">
                              {entry.state.teamA.score}
                            </span>
                          </span>
                          <span className="text-slate-400">vs</span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: entry.state.teamB.color || '#55A9A0' }}
                            />
                            <span>{entry.state.teamB.name}:</span>
                            <span className="text-[#287A74] dark:text-[#AEEED3]">
                              {entry.state.teamB.score}
                            </span>
                          </span>
                        </div>

                        <p className="text-[10px] font-mono text-slate-400">
                          Saved {new Date(entry.updatedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onLoadState(entry.state);
                            onClose();
                          }}
                          aria-label={`Load saved match ${entry.title}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#287A74] text-white dark:bg-[#AEEED3] dark:text-[#0B0F12] text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          <FolderOpen aria-hidden="true" className="w-3.5 h-3.5" />
                          <span>Load</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOverwriteBoard(entry.id, entry.title)}
                          title="Overwrite with current scoreboard"
                          aria-label={`Overwrite saved match ${entry.title}`}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#55A9A0] transition-colors"
                        >
                          <RefreshCw aria-hidden="true" className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBoard(entry.id)}
                          title="Delete saved match"
                          aria-label={`Delete saved match ${entry.title}`}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED TEAMS ROSTER */}
          {activeTab === 'teams' && (
            <div className="space-y-5">
              {/* Quick Save Active Teams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveActiveTeam('A')}
                  aria-label={`Save active Team A (${state.teamA.name}) to roster`}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B0F12]/60 hover:border-[#287A74] dark:hover:border-[#AEEED3] flex items-center justify-between transition-all text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: state.teamA.color || '#287A74' }}
                    />
                    <div className="truncate">
                      <div className="text-[10px] font-mono uppercase text-slate-400">
                        Save Active Team A
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {state.teamA.name}
                      </div>
                    </div>
                  </div>
                  <Plus aria-hidden="true" className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3] flex-shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveActiveTeam('B')}
                  aria-label={`Save active Team B (${state.teamB.name}) to roster`}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B0F12]/60 hover:border-[#287A74] dark:hover:border-[#AEEED3] flex items-center justify-between transition-all text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: state.teamB.color || '#55A9A0' }}
                    />
                    <div className="truncate">
                      <div className="text-[10px] font-mono uppercase text-slate-400">
                        Save Active Team B
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {state.teamB.name}
                      </div>
                    </div>
                  </div>
                  <Plus aria-hidden="true" className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3] flex-shrink-0" />
                </button>
              </div>

              {/* Create New Team Profile Form */}
              <form
                onSubmit={handleCreateCustomTeam}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F12]/50 space-y-3"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Create New Team Preset
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="color"
                    value={newTeamColor}
                    aria-label="Pick new team preset color"
                    onChange={(e) => setNewTeamColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
                    title="Pick Team Color"
                  />
                  <input
                    type="text"
                    required
                    maxLength={22}
                    value={newTeamName}
                    aria-label="New team preset name"
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Team Name (e.g. REAL MADRID)"
                    className="flex-1 min-w-[160px] px-3 py-2 rounded-xl bg-white dark:bg-[#131A20] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <label className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131A20] text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:border-[#55A9A0] flex items-center gap-1.5">
                    <Upload aria-hidden="true" className="w-3.5 h-3.5 text-[#287A74] dark:text-[#AEEED3]" />
                    <span>{newTeamLogo ? 'Logo Ready' : 'Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload new team preset logo"
                      className="hidden"
                      onChange={handleNewTeamLogoUpload}
                    />
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#287A74] text-white dark:bg-[#AEEED3] dark:text-[#0B0F12] text-xs font-bold uppercase tracking-wider"
                  >
                    Add Team
                  </button>
                </div>
              </form>

              {/* Saved Teams List */}
              {teams.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                  <Users aria-hidden="true" className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No saved teams yet
                  </p>
                  <p className="text-xs mt-1">
                    Save your favorite teams with their custom colors and logos for instant 1-click assignment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F12]/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={`${team.name} logo`}
                            width={36}
                            height={36}
                            loading="lazy"
                            decoding="async"
                            className="w-9 h-9 object-contain rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-stadium font-black text-xs flex-shrink-0"
                            style={{
                              backgroundColor: `${team.color}25`,
                              color: team.color,
                            }}
                          >
                            {team.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate font-stadium uppercase">
                            {team.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{team.color}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onAssignTeam('A', team);
                            showToast(`Assigned ${team.name} to Team A`);
                          }}
                          aria-label={`Assign ${team.name} to Team A`}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#287A74] hover:text-white dark:bg-slate-800 dark:hover:bg-[#AEEED3] dark:hover:text-[#0B0F12] text-[10px] font-mono font-bold transition-colors"
                          title="Assign to Team A"
                        >
                          → A
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAssignTeam('B', team);
                            showToast(`Assigned ${team.name} to Team B`);
                          }}
                          aria-label={`Assign ${team.name} to Team B`}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#55A9A0] hover:text-white dark:bg-slate-800 dark:hover:bg-[#55A9A0] dark:hover:text-white text-[10px] font-mono font-bold transition-colors"
                          title="Assign to Team B"
                        >
                          → B
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeams(deleteSavedTeam(team.id))}
                          aria-label={`Delete team ${team.name}`}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete Team"
                        >
                          <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BACKUP EXPORT / IMPORT JSON */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F12]/50 space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#287A74] dark:text-[#AEEED3] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Portable Zero-Server Data Archive
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Export all your saved matches, team rosters, custom hex colors, and compressed logos into a single JSON file, or restore them on another device.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#287A74] text-white dark:bg-[#AEEED3] dark:text-[#0B0F12] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Backup (.JSON)</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131A20] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider hover:border-[#287A74] dark:hover:border-[#AEEED3] cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
                    <span>Import Backup (.JSON)</span>
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={handleImportJson}
                    />
                  </label>
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

export default SavedBoardsModal;
