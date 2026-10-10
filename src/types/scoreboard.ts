export interface TeamData {
  name: string;
  score: number;
  color?: string; // Hex color override
  logo?: string;  // Base64 downscaled image
}

export type PeriodType = 'period' | 'set' | 'quarter' | 'half';

export interface ScoreboardState {
  teamA: TeamData;
  teamB: TeamData;
  period: number;
  periodType: PeriodType;
  timerSeconds: number;
  timerRunning: boolean;
  timerDirection: 'up' | 'down';
  customCss: string;
  isObsMode: boolean;
  chromaColor: string; // Defaults to #00FF00
  soundEnabled: boolean;
}

export const INITIAL_SCOREBOARD_STATE: ScoreboardState = {
  teamA: {
    name: 'TEAM A',
    score: 0,
    color: '#287A74',
  },
  teamB: {
    name: 'TEAM B',
    score: 0,
    color: '#55A9A0',
  },
  period: 1,
  periodType: 'period',
  timerSeconds: 0,
  timerRunning: false,
  timerDirection: 'up',
  customCss: '',
  isObsMode: false,
  chromaColor: '#00FF00',
  soundEnabled: true,
};
