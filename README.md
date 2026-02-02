# FX Trader Simulator

An educational game that simulates FX spot market making. Learn how it feels to price and manage risk as a bank's FX trader.

## Overview

Players act as the spot trader of a bank's FX market making desk, responsible for:
- Pricing EUR/USD quotes to clients (voice and electronic)
- Managing risk through hedging and price skewing
- Reacting to news events and market movements
- Maximizing PnL while maintaining competitive pricing

## Features

### Hedging Panel
Trade at market prices to manage your position:
- Click buy/sell on the size ladder (1M, 5M, 10M, 50M) to hedge
- TWAP algo: Execute large orders over time to minimize market impact

### E-Pricing Panel
Configure your electronic pricing stream:
- **Base Spread**: Adjust the 1M spread (affects all volume tiers)
- **Tier Add-ons**: Additional spread for larger sizes (5M, 10M, 50M)
- **Skew**: Shift your prices to attract flow on one side

### Price Chart
Live EUR/USD chart showing 180 seconds of price history with current price indicator.

### Voice RFQs (Chat)
Salespeople ask you for prices via chat. Respond with:
- A price: `1.0850` or just pips: `50`
- Call off: `care`, `ref`, or `eee`

When trades execute, you'll hear "MINE!" (client bought, you sold) or "YOURS!" (client sold, you bought).

### Electronic RFQs
Clients request quotes that are auto-priced from your e-pricing stream. Watch them in the RFQ blotter - you can pass on any quote before it executes.

### News & Events
- Random news events affect market prices during trading hours
- Scheduled economic data releases (NFP, CPI, PMI, etc.)
- News causes immediate price jumps and sustained market drift
- Upcoming releases shown with expected values

### Market Impact
Your trading activity moves the market:
- Large trades create proportional price impact
- Impact decays over time
- Burst trading (rapid execution) amplifies impact
- Watch the "Impact" indicator in the header

### Sound Effects
Audio feedback for key events:
- Gong sound for news and economic releases
- Horn sound for new voice RFQ requests
- Beep sound when client trades execute

### Trade Blotter
All executed trades (hedge, voice, electronic, algo) with time, client, side, size, price, and type.

### Settings Panel
Click the gear icon to customize simulation parameters:
- Toggle news and economic releases on/off
- Adjust market volatility, drift, and spreads
- Configure market impact behavior
- Enable/disable sound effects
- Apply changes and restart the simulation

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
The EUR/USD mid price follows a random walk with:
- Mean reversion tendency
- Market impact from trading activity
- News-driven jumps and drift
- Configurable volatility

### Clients
Each client has unique characteristics:
- **Competitiveness**: Willingness to accept wider spreads
- **Patience**: How long they wait before deciding
- **Size range**: Typical trade sizes
- **Direction**: Buy-only, sell-only, or both
- **Banks Asked**: How many banks they're quoting (affects market impact)

### PnL Calculation
- **Realized PnL**: Locked in when you close positions
- **Unrealized PnL**: Mark-to-market on open position
- **Total PnL**: Realized + Unrealized

### Game Clock
- 1 real second = 1 game minute
- Trading day starts at 7:00 AM
- News events occur during market hours (7am-5pm)

## Deployment

Build and deploy the static files from the `dist` folder:

```bash
npm run build
```

Compatible with Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any static hosting.

## Future Ideas

- Multiplayer with shared market impact
- Auto-quote limits for large sizes
- Client blocking for problematic behavior
- Time-of-day spread effects
- End-of-day scoring and leaderboards
