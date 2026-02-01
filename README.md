# FX Trader Simulator

An educational game that simulates FX spot market making. Learn how it feels to price and manage risk as a bank's FX trader.

## Overview

Players act as the spot trader of a bank's FX market making desk, responsible for:
- Pricing EUR/USD quotes to clients (voice and electronic)
- Managing risk through hedging and price skewing
- Maximizing PnL while maintaining competitive pricing

## Features

### Hedging Panel
Trade at market prices to manage your position. Click buy/sell on the size ladder (1M, 5M, 10M, 50M) to hedge.

### E-Pricing Panel
Configure your electronic pricing stream:
- **Spread**: WIDEN/TIGHTEN controls to adjust spread in pips
- **Skew**: Shift your prices left/right to attract flow on one side

### Price Chart
Live EUR/USD chart showing 60 seconds of price history with current price indicator.

### Voice RFQs (Chat)
Salespeople ask you for prices via chat. Respond with:
- A price: `1.0850` or just pips: `50`
- Call off: `care`, `ref`, or `eee`

When trades execute, you'll hear "MINE!" (client bought, you sold) or "YOURS!" (client sold, you bought).

### Electronic RFQs
Clients request quotes that are auto-priced from your e-pricing stream. Watch them in the RFQ blotter - you can pass on any quote before it executes.

### Trade Blotter
All executed trades (hedge, voice, electronic) with time, client, side, size, price, and type.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open http://localhost:5173 to play.

## Tech Stack

- **Svelte 5** + TypeScript
- **Vite** for development and building
- Scoped CSS for styling

## Game Mechanics

### Market Price
The EUR/USD mid price follows a random walk with mean reversion. Spreads widen during volatility.

### Clients
Each client has unique characteristics:
- **Competitiveness**: Willingness to accept wider spreads
- **Patience**: How long they wait before deciding
- **Size range**: Typical trade sizes
- **Direction**: Buy-only, sell-only, or both

### PnL Calculation
- **Realized PnL**: Locked in when you close positions
- **Unrealized PnL**: Mark-to-market on open position
- **Total PnL**: Realized + Unrealized

## Future Ideas

- Multiplayer with shared market impact
- Auto-quote limits for large sizes
- Client blocking for problematic behavior
- News feed affecting market prices
- Time-of-day spread effects


- not done deals still have market impact
- add algo trading