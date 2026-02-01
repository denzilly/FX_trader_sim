/**
 * News & Events Engine
 * Manages scheduled economic releases and random news events
 */

// Economic release types
export interface EconomicReleaseType {
  id: string;
  name: string;
  shortName: string;
  country: 'US' | 'EU';
  typicalHour: number;        // Hour in game time (0-23)
  typicalMinute: number;      // Minute (0-59)
  expectedRange: [number, number];  // Range for generating expected values
  surpriseRange: [number, number];  // Range for actual deviation from expected
  unit: string;
  baseImpactPips: number;     // Impact per unit of surprise
  driftPips: number;          // Additional drift over time
  driftMinutes: number;       // How long the drift lasts
  volatilityBoost: number;    // How much to boost volatility (0-1)
}

export interface ScheduledRelease {
  id: string;
  type: EconomicReleaseType;
  scheduledGameMinutes: number;  // Minutes from midnight in game time
  expected: number;
  actual?: number;
  surprise?: number;           // actual - expected
  released: boolean;
  impactDirection?: 'bullish' | 'bearish';
}

export interface NewsItem {
  id: string;
  timestamp: number;           // Game time in minutes from midnight
  headline: string;
  type: 'news' | 'release';
  direction: 'bullish' | 'bearish' | 'neutral';
  impactPips: number;
  releaseData?: {
    name: string;
    actual: number;
    expected: number;
    unit: string;
  };
}

export interface NewsTemplate {
  headline: string;
  direction: 'bullish' | 'bearish';
  immediatePips: number;
  driftPips: number;
  driftMinutes: number;
  volatilityBoost: number;
  minHour?: number;
  maxHour?: number;
}

// Economic release definitions
export const ECONOMIC_RELEASES: EconomicReleaseType[] = [
  {
    id: 'NFP',
    name: 'US Non-Farm Payrolls',
    shortName: 'NFP',
    country: 'US',
    typicalHour: 8,
    typicalMinute: 30,
    expectedRange: [150, 250],      // thousands of jobs
    surpriseRange: [-50, 50],
    unit: 'k',
    baseImpactPips: 0.3,            // per 10k surprise
    driftPips: 10,
    driftMinutes: 30,
    volatilityBoost: 0.8,
  },
  {
    id: 'CPI',
    name: 'US Consumer Price Index',
    shortName: 'CPI',
    country: 'US',
    typicalHour: 8,
    typicalMinute: 30,
    expectedRange: [2.5, 4.0],      // percentage
    surpriseRange: [-0.3, 0.3],
    unit: '%',
    baseImpactPips: 30,             // per 0.1% surprise
    driftPips: 15,
    driftMinutes: 20,
    volatilityBoost: 0.7,
  },
  {
    id: 'PMI',
    name: 'US ISM Manufacturing PMI',
    shortName: 'PMI',
    country: 'US',
    typicalHour: 10,
    typicalMinute: 0,
    expectedRange: [48, 55],        // index
    surpriseRange: [-3, 3],
    unit: '',
    baseImpactPips: 3,              // per point surprise
    driftPips: 5,
    driftMinutes: 15,
    volatilityBoost: 0.4,
  },
  {
    id: 'RETAIL',
    name: 'US Retail Sales',
    shortName: 'Retail',
    country: 'US',
    typicalHour: 8,
    typicalMinute: 30,
    expectedRange: [-0.5, 1.0],     // percentage m/m
    surpriseRange: [-0.5, 0.5],
    unit: '%',
    baseImpactPips: 15,             // per 0.1% surprise
    driftPips: 8,
    driftMinutes: 15,
    volatilityBoost: 0.5,
  },
  {
    id: 'CLAIMS',
    name: 'US Initial Jobless Claims',
    shortName: 'Claims',
    country: 'US',
    typicalHour: 8,
    typicalMinute: 30,
    expectedRange: [200, 280],      // thousands
    surpriseRange: [-20, 20],
    unit: 'k',
    baseImpactPips: -0.2,           // negative: higher claims = weaker USD = EUR up
    driftPips: 3,
    driftMinutes: 10,
    volatilityBoost: 0.3,
  },
  {
    id: 'GDP',
    name: 'US GDP Growth',
    shortName: 'GDP',
    country: 'US',
    typicalHour: 8,
    typicalMinute: 30,
    expectedRange: [1.5, 3.5],      // percentage q/q annualized
    surpriseRange: [-0.5, 0.5],
    unit: '%',
    baseImpactPips: 20,             // per 0.1% surprise
    driftPips: 12,
    driftMinutes: 25,
    volatilityBoost: 0.6,
  },
  {
    id: 'FOMC',
    name: 'FOMC Interest Rate Decision',
    shortName: 'FOMC',
    country: 'US',
    typicalHour: 14,
    typicalMinute: 0,
    expectedRange: [4.5, 5.5],      // percentage
    surpriseRange: [-0.25, 0.25],
    unit: '%',
    baseImpactPips: 80,             // per 0.25% surprise
    driftPips: 20,
    driftMinutes: 60,
    volatilityBoost: 1.0,
  },
  {
    id: 'EU_CPI',
    name: 'Eurozone CPI',
    shortName: 'EU CPI',
    country: 'EU',
    typicalHour: 5,
    typicalMinute: 0,
    expectedRange: [2.0, 3.5],
    surpriseRange: [-0.2, 0.2],
    unit: '%',
    baseImpactPips: -25,            // negative: higher EU CPI = EUR stronger = EUR/USD up
    driftPips: 10,
    driftMinutes: 20,
    volatilityBoost: 0.5,
  },
  {
    id: 'EU_PMI',
    name: 'Eurozone Manufacturing PMI',
    shortName: 'EU PMI',
    country: 'EU',
    typicalHour: 4,
    typicalMinute: 0,
    expectedRange: [45, 52],
    surpriseRange: [-2, 2],
    unit: '',
    baseImpactPips: -2,             // negative: higher EU PMI = EUR stronger
    driftPips: 4,
    driftMinutes: 15,
    volatilityBoost: 0.3,
  },
  {
    id: 'ECB',
    name: 'ECB Interest Rate Decision',
    shortName: 'ECB',
    country: 'EU',
    typicalHour: 7,
    typicalMinute: 45,
    expectedRange: [3.5, 4.5],
    surpriseRange: [-0.25, 0.25],
    unit: '%',
    baseImpactPips: -70,            // negative: higher ECB rate = EUR stronger
    driftPips: 18,
    driftMinutes: 45,
    volatilityBoost: 0.9,
  },
];

// News templates
export const NEWS_TEMPLATES: NewsTemplate[] = [
  // Bearish EUR/USD (USD strength)
  {
    headline: 'Fed Chair signals hawkish stance on inflation',
    direction: 'bearish',
    immediatePips: 12,
    driftPips: 8,
    driftMinutes: 15,
    volatilityBoost: 0.4,
    minHour: 9,
    maxHour: 17,
  },
  {
    headline: 'US Treasury yields surge on strong economic data',
    direction: 'bearish',
    immediatePips: 8,
    driftPips: 5,
    driftMinutes: 10,
    volatilityBoost: 0.3,
  },
  {
    headline: 'Risk-off sentiment drives safe-haven flows to USD',
    direction: 'bearish',
    immediatePips: 10,
    driftPips: 6,
    driftMinutes: 12,
    volatilityBoost: 0.5,
  },
  {
    headline: 'US fiscal outlook improves, dollar rallies',
    direction: 'bearish',
    immediatePips: 6,
    driftPips: 4,
    driftMinutes: 10,
    volatilityBoost: 0.2,
  },
  {
    headline: 'Fed officials hint at prolonged higher rates',
    direction: 'bearish',
    immediatePips: 9,
    driftPips: 6,
    driftMinutes: 15,
    volatilityBoost: 0.4,
    minHour: 10,
    maxHour: 16,
  },
  // Bullish EUR/USD (EUR strength / USD weakness)
  {
    headline: 'ECB signals further rate hikes ahead',
    direction: 'bullish',
    immediatePips: 11,
    driftPips: 7,
    driftMinutes: 15,
    volatilityBoost: 0.4,
    minHour: 4,
    maxHour: 12,
  },
  {
    headline: 'Eurozone economic outlook improves',
    direction: 'bullish',
    immediatePips: 7,
    driftPips: 5,
    driftMinutes: 12,
    volatilityBoost: 0.3,
  },
  {
    headline: 'Fed dovish pivot speculation grows',
    direction: 'bullish',
    immediatePips: 10,
    driftPips: 7,
    driftMinutes: 15,
    volatilityBoost: 0.5,
  },
  {
    headline: 'US debt ceiling concerns weigh on dollar',
    direction: 'bullish',
    immediatePips: 8,
    driftPips: 5,
    driftMinutes: 12,
    volatilityBoost: 0.4,
  },
  {
    headline: 'European energy crisis fears ease',
    direction: 'bullish',
    immediatePips: 6,
    driftPips: 4,
    driftMinutes: 10,
    volatilityBoost: 0.2,
  },
  {
    headline: 'Risk appetite returns, USD safe-haven bid fades',
    direction: 'bullish',
    immediatePips: 7,
    driftPips: 4,
    driftMinutes: 10,
    volatilityBoost: 0.3,
  },
  {
    headline: 'ECB Lagarde strikes hawkish tone',
    direction: 'bullish',
    immediatePips: 9,
    driftPips: 6,
    driftMinutes: 12,
    volatilityBoost: 0.4,
    minHour: 5,
    maxHour: 14,
  },
];

export interface NewsEventsConfig {
  newsChancePerMinute: number;      // Probability of news each game minute
  minNewsBetweenMinutes: number;    // Minimum game minutes between news
  releasesPerDay: number;           // How many economic releases to schedule
  releaseDelayMin?: number;         // Min minutes until next release
  releaseDelayMax?: number;         // Max minutes until next release
  newsEnabled?: boolean;            // Enable random news
  releasesEnabled?: boolean;        // Enable scheduled releases
}

const DEFAULT_CONFIG: NewsEventsConfig = {
  newsChancePerMinute: 0.03,        // ~3% chance per game minute
  minNewsBetweenMinutes: 60,        // At least 60 game minutes between news
  releasesPerDay: 1,                // 1 economic release at a time (always one upcoming)
  releaseDelayMin: 60,
  releaseDelayMax: 120,
  newsEnabled: true,
  releasesEnabled: true,
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createNewsEventsEngine(config: NewsEventsConfig = DEFAULT_CONFIG) {
  let scheduledReleases: ScheduledRelease[] = [];
  let newsHistory: NewsItem[] = [];
  let lastNewsMinute = -999;
  let lastTickMinute = -1;

  // Callbacks
  let onNews: ((item: NewsItem) => void) | null = null;
  let onMarketImpact: ((immediatePips: number, driftPips: number, driftMinutes: number) => void) | null = null;
  let onVolatilityBoost: ((boost: number) => void) | null = null;

  function scheduleNextRelease(afterMinute: number) {
    // Pick a random release type
    const releaseType = randomChoice(ECONOMIC_RELEASES);

    // Schedule it based on config delay range
    const delayMin = config.releaseDelayMin ?? 60;
    const delayMax = config.releaseDelayMax ?? 120;
    const delayMinutes = Math.floor(randomBetween(delayMin, delayMax));
    const scheduledMinutes = afterMinute + delayMinutes;

    const expected = randomBetween(releaseType.expectedRange[0], releaseType.expectedRange[1]);

    const release: ScheduledRelease = {
      id: crypto.randomUUID(),
      type: releaseType,
      scheduledGameMinutes: scheduledMinutes,
      expected: Math.round(expected * 10) / 10,
      released: false,
    };

    scheduledReleases.push(release);
  }

  function ensureUpcomingRelease(currentMinute: number) {
    // Remove old released items
    scheduledReleases = scheduledReleases.filter(r => !r.released);

    // If no upcoming release, schedule one
    if (scheduledReleases.length === 0) {
      scheduleNextRelease(currentMinute);
    }
  }

  function tick(gameMinutes: number): { newItems: NewsItem[] } {
    const newItems: NewsItem[] = [];

    // Avoid processing the same minute twice
    if (gameMinutes === lastTickMinute) {
      return { newItems };
    }
    lastTickMinute = gameMinutes;

    // Check for scheduled releases (only process one at a time)
    if (config.releasesEnabled !== false) {
      const upcomingRelease = scheduledReleases.find(r => !r.released);
      if (upcomingRelease && gameMinutes >= upcomingRelease.scheduledGameMinutes) {
        const item = executeRelease(upcomingRelease, gameMinutes);
        newItems.push(item);
        newsHistory.unshift(item);
        lastNewsMinute = gameMinutes;

        // Schedule the next release
        ensureUpcomingRelease(gameMinutes);
      }
    }

    // Random news generation
    if (config.newsEnabled !== false) {
      const hourOfDay = Math.floor(gameMinutes / 60) % 24;
      const isMarketHours = hourOfDay >= 7 && hourOfDay <= 17;

      if (isMarketHours && gameMinutes - lastNewsMinute >= config.minNewsBetweenMinutes) {
        if (Math.random() < config.newsChancePerMinute) {
          const item = generateRandomNews(gameMinutes);
          if (item) {
            newItems.push(item);
            newsHistory.unshift(item);
            lastNewsMinute = gameMinutes;
          }
        }
      }
    }

    return { newItems };
  }

  function executeRelease(release: ScheduledRelease, gameMinutes: number): NewsItem {
    const type = release.type;

    // Generate actual value with surprise
    const surprise = randomBetween(type.surpriseRange[0], type.surpriseRange[1]);
    const actual = release.expected + surprise;

    release.actual = Math.round(actual * 10) / 10;
    release.surprise = Math.round(surprise * 10) / 10;
    release.released = true;

    // Calculate impact
    // For US data: positive surprise = USD stronger = EUR/USD down (bearish)
    // For EU data: positive surprise = EUR stronger = EUR/USD up (bullish)
    // The baseImpactPips already encodes the direction
    const impactPips = surprise * type.baseImpactPips;
    const direction: 'bullish' | 'bearish' = impactPips > 0 ? 'bearish' : 'bullish';

    release.impactDirection = direction;

    // Apply market impact
    if (onMarketImpact) {
      // Immediate shock (negative for bearish as price goes down)
      const immediateShock = direction === 'bearish' ? -Math.abs(impactPips) : Math.abs(impactPips);
      const driftAmount = direction === 'bearish' ? -type.driftPips : type.driftPips;
      onMarketImpact(immediateShock, driftAmount, type.driftMinutes);
    }

    // Boost volatility
    if (onVolatilityBoost) {
      onVolatilityBoost(type.volatilityBoost);
    }

    const item: NewsItem = {
      id: crypto.randomUUID(),
      timestamp: gameMinutes,
      headline: `${type.shortName}: ${release.actual}${type.unit} vs ${release.expected}${type.unit} exp`,
      type: 'release',
      direction,
      impactPips: Math.abs(impactPips),
      releaseData: {
        name: type.name,
        actual: release.actual,
        expected: release.expected,
        unit: type.unit,
      },
    };

    if (onNews) onNews(item);
    return item;
  }

  function generateRandomNews(gameMinutes: number): NewsItem | null {
    const hourOfDay = Math.floor(gameMinutes / 60) % 24;

    // Filter templates by time window
    const validTemplates = NEWS_TEMPLATES.filter(t => {
      if (t.minHour !== undefined && hourOfDay < t.minHour) return false;
      if (t.maxHour !== undefined && hourOfDay > t.maxHour) return false;
      return true;
    });

    if (validTemplates.length === 0) return null;

    const template = randomChoice(validTemplates);

    // Apply market impact
    if (onMarketImpact) {
      const immediateShock = template.direction === 'bearish'
        ? -template.immediatePips
        : template.immediatePips;
      const driftAmount = template.direction === 'bearish'
        ? -template.driftPips
        : template.driftPips;
      onMarketImpact(immediateShock, driftAmount, template.driftMinutes);
    }

    // Boost volatility
    if (onVolatilityBoost) {
      onVolatilityBoost(template.volatilityBoost);
    }

    const item: NewsItem = {
      id: crypto.randomUUID(),
      timestamp: gameMinutes,
      headline: template.headline,
      type: 'news',
      direction: template.direction,
      impactPips: template.immediatePips,
    };

    if (onNews) onNews(item);
    return item;
  }

  function getUpcomingRelease(): ScheduledRelease | null {
    return scheduledReleases.find(r => !r.released) || null;
  }

  function getNewsHistory(): NewsItem[] {
    return [...newsHistory];
  }

  function reset(startMinute: number) {
    newsHistory = [];
    scheduledReleases = [];
    lastNewsMinute = -999;
    lastTickMinute = -1;
    // Schedule the first release
    scheduleNextRelease(startMinute);
  }

  return {
    tick,
    getUpcomingRelease,
    getNewsHistory,
    getScheduledReleases: () => [...scheduledReleases],
    reset,
    setOnNews: (cb: typeof onNews) => { onNews = cb; },
    setOnMarketImpact: (cb: typeof onMarketImpact) => { onMarketImpact = cb; },
    setOnVolatilityBoost: (cb: typeof onVolatilityBoost) => { onVolatilityBoost = cb; },
  };
}
