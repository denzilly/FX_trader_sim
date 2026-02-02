/**
 * Spread Engine
 * Manages dynamic spread fluctuation with tier-based pricing
 * Includes time-of-day session effects
 */

export interface TierSpreads {
  '1': number;
  '5': number;
  '10': number;
  '50': number;
}

// Trading sessions with spread multipliers
export type TradingSession = 'TK' | 'LDN' | 'LDN/NY' | 'NY';

export interface SessionInfo {
  name: TradingSession;
  label: string;
  spreadMultiplier: number;
}

// Session definitions with spread multipliers
// LDN/NY overlap has tightest spreads (1.0x)
// Other sessions have wider spreads
const SESSIONS: Record<TradingSession, SessionInfo> = {
  'TK': { name: 'TK', label: 'Tokyo', spreadMultiplier: 1.8 },        // Widest (overnight)
  'LDN': { name: 'LDN', label: 'London', spreadMultiplier: 1.2 },     // Medium
  'LDN/NY': { name: 'LDN/NY', label: 'London/NY', spreadMultiplier: 1.0 }, // Tightest
  'NY': { name: 'NY', label: 'New York', spreadMultiplier: 1.4 },     // Medium-wide
};

/**
 * Get the current trading session based on game hour
 * TK: 10pm - 8am (22:00 - 08:00)
 * LDN: 8am - 1pm (08:00 - 13:00)
 * LDN/NY: 1pm - 5pm (13:00 - 17:00)
 * NY: 5pm - 10pm (17:00 - 22:00)
 */
export function getSessionForHour(hour: number): SessionInfo {
  if (hour >= 8 && hour < 13) {
    return SESSIONS['LDN'];
  } else if (hour >= 13 && hour < 17) {
    return SESSIONS['LDN/NY'];
  } else if (hour >= 17 && hour < 22) {
    return SESSIONS['NY'];
  } else {
    return SESSIONS['TK'];
  }
}

export interface SpreadConfig {
  baseSpreadMin: number;     // Minimum 1M spread in price terms (e.g., 0 pips = 0)
  baseSpreadMax: number;     // Maximum 1M spread in price terms (e.g., 1 pip = 0.0001)
  baseSpreadMean: number;    // Mean reversion target
  spreadVolatility: number;  // How much spread fluctuates per tick
  meanReversionSpeed: number; // How fast spread reverts to mean (0-1)
  tierAdditions: {           // Additional spread per tier (in price terms)
    '1': number;
    '5': number;
    '10': number;
    '50': number;
  };
  tierMinimums: {            // Minimum spread per tier (in price terms)
    '1': number;
    '5': number;
    '10': number;
    '50': number;
  };
}

const DEFAULT_CONFIG: SpreadConfig = {
  baseSpreadMin: 0.00005,              // 0.5 pips
  baseSpreadMax: 0.0002,               // 2 pips
  baseSpreadMean: 0.0001,              // 1 pip
  spreadVolatility: 0.00002,           // 0.2 pip fluctuation per tick
  meanReversionSpeed: 0.05,            // Slow mean reversion
  tierAdditions: {
    '1': 0,
    '5': 0.00005,                      // +0.5 pips
    '10': 0.0001,                      // +1.0 pips
    '50': 0.0002,                      // +2.0 pips
  },
  tierMinimums: {
    '1': 0.00005,                      // 0.5 pips minimum
    '5': 0.0001,                       // 1.0 pips minimum
    '10': 0.00015,                     // 1.5 pips minimum
    '50': 0.00025,                     // 2.5 pips minimum
  },
};

export function createSpreadEngine(config: SpreadConfig = DEFAULT_CONFIG) {
  let baseSpread = config.baseSpreadMean;
  let volatilityFactor = 0; // 0 = calm, increases with news/events
  let sessionMultiplier = 1.0; // Session-based spread multiplier

  function tick(): TierSpreads {
    // Random walk with mean reversion for base spread
    const randomMove = (Math.random() - 0.5) * 2 * config.spreadVolatility;
    const meanReversion = (config.baseSpreadMean - baseSpread) * config.meanReversionSpeed;

    baseSpread += randomMove + meanReversion;

    // Clamp to bounds (adjusted by volatility factor)
    const maxSpread = config.baseSpreadMax * (1 + volatilityFactor);
    baseSpread = Math.max(config.baseSpreadMin, Math.min(maxSpread, baseSpread));

    // Calculate tier spreads with volatility and session multipliers
    const totalMultiplier = (1 + volatilityFactor) * sessionMultiplier;

    return {
      '1': Math.max(
        config.tierMinimums['1'] * totalMultiplier,
        baseSpread * totalMultiplier
      ),
      '5': Math.max(
        config.tierMinimums['5'] * totalMultiplier,
        (baseSpread + config.tierAdditions['5']) * totalMultiplier
      ),
      '10': Math.max(
        config.tierMinimums['10'] * totalMultiplier,
        (baseSpread + config.tierAdditions['10']) * totalMultiplier
      ),
      '50': Math.max(
        config.tierMinimums['50'] * totalMultiplier,
        (baseSpread + config.tierAdditions['50']) * totalMultiplier
      ),
    };
  }

  function setSessionMultiplier(multiplier: number) {
    sessionMultiplier = Math.max(0.5, multiplier); // Minimum 0.5x
  }

  function getSessionMultiplier(): number {
    return sessionMultiplier;
  }

  function setVolatilityFactor(factor: number) {
    volatilityFactor = Math.max(0, factor);
  }

  function getVolatilityFactor(): number {
    return volatilityFactor;
  }

  function getBaseSpread(): number {
    return baseSpread;
  }

  return {
    tick,
    setVolatilityFactor,
    getVolatilityFactor,
    setSessionMultiplier,
    getSessionMultiplier,
    getBaseSpread,
  };
}
