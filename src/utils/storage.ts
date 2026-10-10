import type { ScoreboardState, TeamData } from '../types/scoreboard';

export interface SavedBoardEntry {
  id: string;
  title: string;
  updatedAt: number;
  state: ScoreboardState;
}

export interface SavedTeamProfile {
  id: string;
  name: string;
  color: string;
  logo?: string;
  createdAt: number;
}

const ACTIVE_BOARD_KEY = 'matchboard_active_board_v1';
const SAVED_BOARDS_KEY = 'matchboard_saved_boards_v1';
const SAVED_TEAMS_KEY = 'matchboard_saved_teams_v1';

// --- Active Session Persistence ---

export function saveActiveBoardState(state: ScoreboardState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_BOARD_KEY, JSON.stringify(state));
  } catch (_) {
    // Graceful fallback if quota exceeded
  }
}

export function loadActiveBoardState(): Partial<ScoreboardState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_BOARD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ScoreboardState>;
  } catch (_) {
    return null;
  }
}

// --- Unlimited Saved Scoreboards ---

export function getSavedBoards(): SavedBoardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_BOARDS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as SavedBoardEntry[];
    return Array.isArray(list) ? list.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch (_) {
    return [];
  }
}

export function saveBoardToStorage(
  state: ScoreboardState,
  customTitle?: string,
  existingId?: string
): SavedBoardEntry[] {
  const boards = getSavedBoards();
  const id = existingId || `board_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const defaultTitle = `${state.teamA.name} vs ${state.teamB.name} (${state.teamA.score} - ${state.teamB.score})`;
  const title = customTitle?.trim() || defaultTitle;

  const entry: SavedBoardEntry = {
    id,
    title,
    updatedAt: Date.now(),
    state: {
      ...state,
      timerRunning: false, // Pause timer when saving snapshot
      isObsMode: false,
    },
  };

  const existingIdx = boards.findIndex((b) => b.id === id);
  if (existingIdx >= 0) {
    boards[existingIdx] = entry;
  } else {
    boards.unshift(entry);
  }

  try {
    localStorage.setItem(SAVED_BOARDS_KEY, JSON.stringify(boards));
  } catch (_) {
    throw new Error('Browser LocalStorage quota reached. Try removing unused logos or old matches.');
  }

  return boards;
}

export function deleteSavedBoard(id: string): SavedBoardEntry[] {
  const boards = getSavedBoards().filter((b) => b.id !== id);
  try {
    localStorage.setItem(SAVED_BOARDS_KEY, JSON.stringify(boards));
  } catch (_) {}
  return boards;
}

// --- Unlimited Saved Team Profiles ---

export function getSavedTeams(): SavedTeamProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_TEAMS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as SavedTeamProfile[];
    return Array.isArray(list) ? list.sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch (_) {
    return [];
  }
}

export function saveTeamProfile(team: TeamData): SavedTeamProfile[] {
  const teams = getSavedTeams();
  const normalizedName = team.name.trim().toUpperCase();

  // Update if same name exists, otherwise insert
  const existingIdx = teams.findIndex((t) => t.name.toUpperCase() === normalizedName);
  const entry: SavedTeamProfile = {
    id: existingIdx >= 0 ? teams[existingIdx].id : `team_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: team.name.trim() || 'TEAM',
    color: team.color || '#287A74',
    logo: team.logo,
    createdAt: Date.now(),
  };

  if (existingIdx >= 0) {
    teams[existingIdx] = entry;
  } else {
    teams.unshift(entry);
  }

  try {
    localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(teams));
  } catch (_) {
    throw new Error('Browser LocalStorage quota reached.');
  }

  return teams;
}

export function deleteSavedTeam(id: string): SavedTeamProfile[] {
  const teams = getSavedTeams().filter((t) => t.id !== id);
  try {
    localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(teams));
  } catch (_) {}
  return teams;
}

// --- Export & Import Backup ---

export function exportAllDataAsJson(): string {
  const data = {
    app: 'match-board.github.io',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    boards: getSavedBoards(),
    teams: getSavedTeams(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDataFromJson(jsonString: string): {
  boards: SavedBoardEntry[];
  teams: SavedTeamProfile[];
} {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup JSON file.');
  }

  const importedBoards = Array.isArray(parsed.boards) ? (parsed.boards as SavedBoardEntry[]) : [];
  const importedTeams = Array.isArray(parsed.teams) ? (parsed.teams as SavedTeamProfile[]) : [];

  const currentBoards = getSavedBoards();
  const currentTeams = getSavedTeams();

  // Merge by ID without duplicates
  const mergedBoardsMap = new Map<string, SavedBoardEntry>();
  [...currentBoards, ...importedBoards].forEach((b) => {
    if (b && b.id && b.state) mergedBoardsMap.set(b.id, b);
  });

  const mergedTeamsMap = new Map<string, SavedTeamProfile>();
  [...currentTeams, ...importedTeams].forEach((t) => {
    if (t && t.id && t.name) mergedTeamsMap.set(t.id, t);
  });

  const finalBoards = Array.from(mergedBoardsMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  const finalTeams = Array.from(mergedTeamsMap.values()).sort((a, b) => b.createdAt - a.createdAt);

  localStorage.setItem(SAVED_BOARDS_KEY, JSON.stringify(finalBoards));
  localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(finalTeams));

  return { boards: finalBoards, teams: finalTeams };
}
