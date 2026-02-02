/**
 * Settings Store
 * Configurable simulation parameters that can be adjusted at runtime
 */

import { writable, derived } from 'svelte/store';

// Market simulation settings
export interface MarketSettings {
  initialMid: number;
  volatility: number;      // Price movement per tick
  drift: number;           // Directional bias
  baseSpread: number;      // Base spread in price terms
}

// Market impact settings
export interface ImpactSettings {
  enabled: boolean;
  halfLifeMs: number;
  maxImpactPips: number;
  sizeScaleFactor: number;
  burstWindowMs: number;
  burstMultiplierMax: number;
}

// News & Events settings
export interface NewsSettings {
  newsEnabled: boolean;           // Random news headlines
  releasesEnabled: boolean;       // Scheduled data releases
  newsChancePerMinute: number;
  minNewsBetweenMinutes: number;
  releaseDelayMin: number;        // Min minutes until next release
  releaseDelayMax: number;        // Max minutes until next release
}

// Sound settings
export interface SoundSettings {
  enabled: boolean;
  volume: number;                 // 0.0 to 1.0
}

// Combined settings
export interface SimulationSettings {
  market: MarketSettings;
  impact: ImpactSettings;
  news: NewsSettings;
  sound: SoundSettings;
}

// Default values
const DEFAULT_SETTINGS: SimulationSettings = {
  market: {
    initialMid: 1.0850,
    volatility: 0.00005,
    drift: 0.0,
    baseSpread: 0.00008,
  },
  impact: {
    enabled: true,
    halfLifeMs: 1000,
    maxImpactPips: 3,
    sizeScaleFactor: 0.000005,
    burstWindowMs: 5000,
    burstMultiplierMax: 3,
  },
  news: {
    newsEnabled: true,
    releasesEnabled: true,
    newsChancePerMinute: 0.03,
    minNewsBetweenMinutes: 60,
    releaseDelayMin: 60,
    releaseDelayMax: 120,
  },
  sound: {
    enabled: true,
    volume: 0.5,
  },
};

// Create the store
function createSettingsStore() {
  const { subscribe, set, update } = writable<SimulationSettings>(DEFAULT_SETTINGS);

  return {
    subscribe,
    set,
    update,
    reset: () => set(DEFAULT_SETTINGS),

    // Convenience updaters
    updateMarket: (changes: Partial<MarketSettings>) => {
      update(s => ({ ...s, market: { ...s.market, ...changes } }));
    },
    updateImpact: (changes: Partial<ImpactSettings>) => {
      update(s => ({ ...s, impact: { ...s.impact, ...changes } }));
    },
    updateNews: (changes: Partial<NewsSettings>) => {
      update(s => ({ ...s, news: { ...s.news, ...changes } }));
    },
    updateSound: (changes: Partial<SoundSettings>) => {
      update(s => ({ ...s, sound: { ...s.sound, ...changes } }));
    },
  };
}

export const settings = createSettingsStore();

// Derived stores for easy access
export const marketSettings = derived(settings, $s => $s.market);
export const impactSettings = derived(settings, $s => $s.impact);
export const newsSettings = derived(settings, $s => $s.news);
export const soundSettings = derived(settings, $s => $s.sound);
