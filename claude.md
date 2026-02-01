# FX Trader Simulator

## Project Overview
An educational game simulating FX spot market making. Players act as a bank's FX spot trader, responsible for pricing EUR/USD quotes and managing risk through hedging and e-pricing configuration.

## Tech Stack
- **Framework**: Svelte 5 + TypeScript
- **Build Tool**: Vite
- **Styling**: Scoped CSS (component-level)

## Key Concepts
- **Market Making**: Providing bid/offer prices to clients and profiting from the spread
- **Risk Management**: Managing position exposure through hedging or skewing prices
- **Electronic vs Voice**: Two channels for client pricing - automated RFQ and manual chat
- **Pips**: 1 pip = 0.0001 (4th decimal place for EUR/USD)

## Project Structure
```
src/
├── App.svelte              # Main cockpit layout (6-panel grid)
├── app.css                 # Global styles
├── main.ts                 # Entry point
└── lib/
    ├── components/         # UI modules
    │   ├── Hedging.svelte      # Market trading interface (buy/sell at market)
    │   ├── EPricing.svelte     # Electronic pricing config (spread/skew)
    │   ├── Chart.svelte        # Live EUR/USD price chart
    │   ├── TradeBlotter.svelte # Executed trades history
    │   ├── RfqBlotter.svelte   # Electronic RFQ requests (live pricing)
    │   └── Chat.svelte         # Voice RFQ via salespeople
    ├── simulation/         # Core game logic (pure TS, no UI)
    │   ├── market.ts           # Market price engine (random walk)
    │   ├── spread.ts           # Tiered spread engine
    │   ├── client.ts           # Client definitions & behaviors
    │   ├── position.ts         # Position & PnL tracking
    │   ├── voiceRfq.ts         # Voice RFQ engine (chat-based)
    │   ├── electronicRfq.ts    # Electronic RFQ engine
    │   └── gameLoop.ts         # Main tick loop, coordinates all engines
    ├── stores/             # Svelte stores (state management)
    │   └── game.ts             # Central game state
    └── utils/
        └── format.ts           # Price/currency formatting
```

## Architecture

### Core Systems
1. **Market Price Engine** (`simulation/market.ts`) - Simulates EUR/USD mid price (random walk with mean reversion)
2. **Spread Engine** (`simulation/spread.ts`) - Manages tiered spreads (1M, 5M, 10M, 50M) with volatility effects
3. **Position Tracker** (`simulation/position.ts`) - Tracks position, exposure, realized/unrealized PnL
4. **Voice RFQ Engine** (`simulation/voiceRfq.ts`) - Manages chat-based RFQs from salespeople
5. **Electronic RFQ Engine** (`simulation/electronicRfq.ts`) - Manages automated RFQs using e-pricing stream
6. **Game Loop** (`simulation/gameLoop.ts`) - Coordinates tick intervals and state updates

### State Management
Central state in `stores/game.ts` using Svelte stores:
- `marketMid` - Current mid price
- `tierSpreads` - Spreads for each size tier
- `tierPrices` - Derived bid/ask for each tier
- `ePricingConfig` - Electronic pricing spread/skew settings
- `ePrices` - Derived e-pricing bid/ask
- `position` - Player's EUR position (amount, average price)
- `pnl` - Realized/unrealized/total PnL
- `trades` - Trade history
- `chatMessages` - Voice RFQ chat messages
- `activeVoiceRfqs` - Current voice RFQs
- `electronicRfqs` - Electronic RFQ queue

### Trade Types
- `hedge` - Market trades (player hedging position)
- `voice` - Voice RFQs (via chat with salespeople)
- `electronic` - Electronic RFQs (auto-quoted via e-pricing)

### Side Logic (Critical)
- Client **BUY** = We **SELL** = Sales shouts **"MINE!"** = Position goes SHORT
- Client **SELL** = We **BUY** = Sales shouts **"YOURS!"** = Position goes LONG

## Development Commands
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## Voice RFQ Commands
When an RFQ is active in chat:
- Full price: `1.0850` - Quote at that price
- Pips only: `50` or `5` - Quote using current big figure + pips
- Call off: `care`, `ref`, `eee`, `off` - Decline to quote

## Current Status
Core gameplay implemented:
- Live ticking market prices with tiered spreads
- Hedging panel with size ladder (1M, 5M, 10M, 50M)
- E-pricing panel with spread/skew controls
- Live price chart with 60 seconds of history
- Voice RFQ system via chat
- Electronic RFQ system with live pricing
- Trade blotter showing all executed trades
- Position and PnL tracking

## Sample Clients
- **MacroHard Corp** - Medium competitiveness, 5-25M, buys and sells
- **Bill's Bakery** - High competitiveness, 1-5M, always buys EUR
- **ABC Capital** - Low competitiveness (price sensitive), 10-50M, buys and sells
