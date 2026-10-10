import LZString from 'lz-string';
import type { ScoreboardState, PeriodType } from '../types/scoreboard';

/**
 * Compact wire format for URL hash compression (#data=...)
 * Uses short keys to keep WhatsApp / social links ultra-compact.
 */
interface CompactPayload {
  aN: string;       // Team A Name
  aS: number;       // Team A Score
  aC?: string;      // Team A Color
  aL?: string;      // Team A Logo (included if compact)
  bN: string;       // Team B Name
  bS: number;       // Team B Score
  bC?: string;      // Team B Color
  bL?: string;      // Team B Logo (included if compact)
  p: number;        // Period
  pt: PeriodType;   // Period Type
  t: number;        // Timer Seconds
  td?: 'up' | 'down';
  css?: string;     // Custom CSS
  obs?: number;     // 1 if OBS mode active
  cc?: string;      // Chroma color
}

const MAX_SAFE_URL_LOGO_LENGTH = 1800;

export function encodeStateToHash(state: ScoreboardState): string {
  const payload: CompactPayload = {
    aN: state.teamA.name,
    aS: state.teamA.score,
    aC: state.teamA.color,
    bN: state.teamB.name,
    bS: state.teamB.score,
    bC: state.teamB.color,
    p: state.period,
    pt: state.periodType,
    t: state.timerSeconds,
  };

  if (state.timerDirection !== 'up') {
    payload.td = state.timerDirection;
  }
  if (state.customCss?.trim()) {
    payload.css = state.customCss.trim();
  }
  if (state.isObsMode) {
    payload.obs = 1;
  }
  if (state.chromaColor && state.chromaColor !== '#00FF00') {
    payload.cc = state.chromaColor;
  }

  // Include logos in URL hash if they are compact enough for messaging apps
  if (state.teamA.logo && state.teamA.logo.length < MAX_SAFE_URL_LOGO_LENGTH) {
    payload.aL = state.teamA.logo;
  }
  if (state.teamB.logo && state.teamB.logo.length < MAX_SAFE_URL_LOGO_LENGTH) {
    payload.bL = state.teamB.logo;
  }

  const json = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `#data=${compressed}`;
}

export function decodeStateFromHash(hash: string): Partial<ScoreboardState> | null {
  try {
    if (!hash || !hash.includes('data=')) return null;

    const rawHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(rawHash);
    const encodedData = params.get('data');

    if (!encodedData) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed) as CompactPayload;
    if (typeof parsed !== 'object' || parsed === null) return null;

    const restored: Partial<ScoreboardState> = {
      teamA: {
        name: typeof parsed.aN === 'string' ? parsed.aN : 'TEAM A',
        score: typeof parsed.aS === 'number' && !isNaN(parsed.aS) ? Math.max(0, parsed.aS) : 0,
        color: parsed.aC || '#287A74',
        logo: parsed.aL,
      },
      teamB: {
        name: typeof parsed.bN === 'string' ? parsed.bN : 'TEAM B',
        score: typeof parsed.bS === 'number' && !isNaN(parsed.bS) ? Math.max(0, parsed.bS) : 0,
        color: parsed.bC || '#55A9A0',
        logo: parsed.bL,
      },
      period: typeof parsed.p === 'number' && parsed.p >= 1 ? parsed.p : 1,
      periodType: parsed.pt || 'period',
      timerSeconds: typeof parsed.t === 'number' && parsed.t >= 0 ? parsed.t : 0,
      timerDirection: parsed.td || 'up',
      customCss: parsed.css || '',
      isObsMode: parsed.obs === 1,
      chromaColor: parsed.cc || '#00FF00',
    };

    return restored;
  } catch (_) {
    return null;
  }
}

export function updateUrlHashSilently(state: ScoreboardState): string {
  if (typeof window === 'undefined') return '';
  const hash = encodeStateToHash(state);
  const newUrl = `${window.location.pathname}${window.location.search}${hash}`;
  window.history.replaceState(null, '', newUrl);
  return window.location.href;
}
