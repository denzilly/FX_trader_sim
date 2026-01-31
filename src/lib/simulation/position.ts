/**
 * Position & PNL Tracker
 * Tracks risk position, exposure, and profitability
 */

export interface Position {
  amount: number; // positive = long EUR, negative = short EUR
  averagePrice: number;
  currency: 'EUR';
}

export interface PnL {
  realized: number;
  unrealized: number;
  total: number;
}

export interface Trade {
  id: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  timestamp: number;
  clientId?: string;
  type: 'hedge' | 'client';
}

export function createPositionTracker() {
  let position: Position = {
    amount: 0,
    averagePrice: 0,
    currency: 'EUR',
  };

  let realizedPnL = 0;
  const trades: Trade[] = [];

  function executeTrade(trade: Omit<Trade, 'id' | 'timestamp'>): Trade {
    const fullTrade: Trade = {
      ...trade,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const tradeAmount = trade.side === 'buy' ? trade.size : -trade.size;

    // Calculate realized PnL if reducing position
    if (position.amount !== 0 && Math.sign(tradeAmount) !== Math.sign(position.amount)) {
      const closedAmount = Math.min(Math.abs(tradeAmount), Math.abs(position.amount));
      const pnlPerUnit = trade.side === 'sell'
        ? trade.price - position.averagePrice
        : position.averagePrice - trade.price;
      realizedPnL += closedAmount * pnlPerUnit * 1_000_000; // Convert to USD
    }

    // Update position
    const newAmount = position.amount + tradeAmount;
    if (Math.sign(newAmount) === Math.sign(position.amount) || position.amount === 0) {
      // Adding to position - update average price
      const totalCost = position.amount * position.averagePrice + tradeAmount * trade.price;
      position.averagePrice = newAmount !== 0 ? totalCost / newAmount : 0;
    } else {
      // Flipped position - new average is trade price
      position.averagePrice = trade.price;
    }

    position.amount = newAmount;
    trades.push(fullTrade);

    return fullTrade;
  }

  function getUnrealizedPnL(currentMid: number): number {
    if (position.amount === 0) return 0;
    const pnlPerUnit = currentMid - position.averagePrice;
    return position.amount * pnlPerUnit * 1_000_000;
  }

  function getPnL(currentMid: number): PnL {
    const unrealized = getUnrealizedPnL(currentMid);
    return {
      realized: realizedPnL,
      unrealized,
      total: realizedPnL + unrealized,
    };
  }

  return {
    executeTrade,
    getPnL,
    getPosition: () => ({ ...position }),
    getTrades: () => [...trades],
  };
}
