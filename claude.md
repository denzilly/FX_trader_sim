# FX Trader Simulator

## Project Overview
An educational game simulating FX spot market making. Players act as a bank's FX spot trader, responsible for pricing EUR/USD quotes and managing risk.

## Tech Stack
- **Framework**: Svelte + TypeScript
- **Build Tool**: Vite
- **Styling**: Scoped CSS (component-level)

## Key Concepts
- **Market Making**: Providing bid/offer prices to clients and profiting from the spread
- **Risk Management**: Managing position exposure through hedging or skewing prices
- **Electronic vs Voice**: Two channels for client pricing - automated RFQ and manual chat

## Project Structure
```
src/
├── App.svelte              # Main cockpit layout (6-panel grid)
├── app.css                 # Global styles
├── main.ts                 # Entry point
└── lib/
    ├── components/         # UI modules
    │   ├── Hedging.svelte      # Market trading interface
    │   ├── EPricing.svelte     # Electronic pricing config
    │   ├── News.svelte         # News feed
    │   ├── TradeBlotter.svelte # Active requests & trades
    │   ├── Chat.svelte         # Voice pricing via sales
    │   └── RiskPnl.svelte      # Position & PNL display
    ├── simulation/         # Core game logic (pure TS, no UI)
    │   ├── market.ts           # Market price engine
    │   ├── client.ts           # Client system & behaviors
    │   └── position.ts         # Position & PNL tracking
    └── stores/             # Svelte stores (state management)
        └── game.ts             # Central game state
```

## Architecture

### Core Systems
1. **Market Price Engine** (`simulation/market.ts`) - Simulates EUR/USD price movement (random walk + drift + external factors)
2. **Client System** (`simulation/client.ts`) - Manages client behaviors and trade requests
3. **Position Tracker** (`simulation/position.ts`) - Tracks position, exposure, and profitability

### State Management
Central state in `stores/game.ts` using Svelte stores:
- `marketPrice` - Current bid/ask/mid
- `position` - Player's EUR position
- `pnl` - Realized/unrealized PNL
- `tradeRequests` - Active client RFQs
- `ePricingConfig` - Electronic pricing settings

## Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Current Status
Scaffolding complete - static cockpit layout with placeholder data. Next: wire up market price engine to create live ticking prices.
