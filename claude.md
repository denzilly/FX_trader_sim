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
- **Market Impact**: Large trades and client activity move the market price

## Project Structure
```
src/
├── App.svelte              # Main cockpit layout (7-panel grid)
├── app.css                 # Global styles
├── main.ts                 # Entry point
└── lib/
    ├── components/         # UI modules
    │   ├── Hedging.svelte      # Market trading + TWAP algo interface
    │   ├── EPricing.svelte     # Electronic pricing config (base spread/skew)
    │   ├── Chart.svelte        # Live EUR/USD price chart
    │   ├── TradeBlotter.svelte # Executed trades history
    │   ├── RfqBlotter.svelte   # Electronic RFQ requests (live pricing)
    │   ├── Chat.svelte         # Voice RFQ via salespeople
    │   ├── NewsEvents.svelte   # News feed & upcoming releases
    │   └── Settings.svelte     # Simulation settings modal
    ├── simulation/         # Core game logic (pure TS, no UI)
    │   ├── market.ts           # Market price engine (random walk + impact)
    │   ├── spread.ts           # Tiered spread engine
    │   ├── client.ts           # Client definitions & behaviors
    │   ├── position.ts         # Position & PnL tracking
    │   ├── voiceRfq.ts         # Voice RFQ engine (chat-based)
    │   ├── electronicRfq.ts    # Electronic RFQ engine
    │   ├── newsEvents.ts       # News & economic releases engine
    │   └── gameLoop.ts         # Main tick loop, coordinates all engines
    ├── stores/             # Svelte stores (state management)
    │   ├── game.ts             # Central game state
    │   └── settings.ts         # Simulation settings store
    └── utils/
        └── format.ts           # Price/currency formatting
```

## Architecture

### Core Systems
1. **Market Price Engine** (`simulation/market.ts`) - Simulates EUR/USD mid price (random walk with market impact)
2. **Spread Engine** (`simulation/spread.ts`) - Manages tiered spreads (1M, 5M, 10M, 50M) with volatility and session effects
3. **Position Tracker** (`simulation/position.ts`) - Tracks position, exposure, realized/unrealized PnL
4. **Voice RFQ Engine** (`simulation/voiceRfq.ts`) - Manages chat-based RFQs from salespeople
5. **Electronic RFQ Engine** (`simulation/electronicRfq.ts`) - Manages automated RFQs using e-pricing stream
6. **News Events Engine** (`simulation/newsEvents.ts`) - Generates random news and scheduled economic releases
7. **Game Loop** (`simulation/gameLoop.ts`) - Coordinates tick intervals and state updates

### State Management
Central state in `stores/game.ts` using Svelte stores:
- `marketMid` - Current mid price
- `priceHistory` - Chart price history (resets on game restart)
- `tierSpreads` - Spreads for each size tier
- `tierPrices` - Derived bid/ask for each tier
- `ePricingConfig` - Electronic pricing: base spread (affects all tiers), tier-specific add-ons, skew
- `eTierPrices` - Derived e-pricing bid/ask per tier
- `position` - Player's EUR position (amount, average price)
- `pnl` - Realized/unrealized/total PnL
- `trades` - Trade history
- `chatMessages` - Voice RFQ chat messages
- `activeVoiceRfqs` - Current voice RFQs
- `electronicRfqs` - Electronic RFQ queue
- `marketImpact` - Current market impact pressure (pips)
- `twapState` - TWAP algo execution state
- `newsHistory` - News items that have occurred
- `upcomingRelease` - Next scheduled economic release
- `currentSession` - Current trading session (TK, LDN, LDN/NY, NY)

Settings in `stores/settings.ts`:
- `market` - Initial mid, volatility, drift, base spread
- `impact` - Half-life, max impact, size scale, burst detection
- `news` - News/releases enabled, frequency, delay ranges

### Trade Types
- `hedge` - Market trades (player hedging position)
- `voice` - Voice RFQs (via chat with salespeople)
- `electronic` - Electronic RFQs (auto-quoted via e-pricing)
- `algo` - TWAP algorithm trades

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

## E-Pricing Configuration
- **Base Spread**: The 1M spread that applies to ALL volume tiers (controlled by -/+ buttons)
- **Tier Additional**: Extra spread for larger sizes (5M, 10M, 50M) on top of base
- **Skew**: Shift all prices left (favor selling) or right (favor buying)

## Market Impact System
Trading activity moves the market:
- Trades create impact proportional to size
- Impact decays over time (configurable half-life)
- Burst detection: rapid trading amplifies impact
- Client "banks asked" reduces impact (competition)

## Trading Sessions
Spreads vary by time of day based on trading session:
- **TK (Tokyo)**: 10pm - 8am - Widest spreads (1.8x multiplier)
- **LDN (London)**: 8am - 1pm - Medium spreads (1.2x multiplier)
- **LDN/NY (Overlap)**: 1pm - 5pm - Tightest spreads (1.0x multiplier)
- **NY (New York)**: 5pm - 10pm - Medium-wide spreads (1.4x multiplier)

Session is displayed in the header with flag emoji indicators.

## News & Events System
- Random news events during market hours (7am-5pm game time)
- Scheduled economic releases with actual vs expected values
- News can cause immediate price jumps and sustained drift
- Volatility boosts affect spreads temporarily

## Settings Panel
Access via gear icon in header. Configurable parameters:
- News & Events: Toggle news/releases, adjust frequency
- Market Simulation: Initial price, volatility, drift, base spread
- Market Impact: Enable/disable, half-life, max impact, burst settings

## Current Status
Full gameplay implemented:
- Live ticking market prices with tiered spreads
- Hedging panel with size ladder (1M, 5M, 10M, 50M) + TWAP algo
- E-pricing panel with base spread and skew controls
- Live price chart (180 seconds history, resets on restart)
- Voice RFQ system via chat
- Electronic RFQ system with live pricing
- Trade blotter showing all executed trades
- Position and PnL tracking in header
- Market impact from all trading activity
- News & economic data releases affecting prices
- Trading session-based spread adjustments (TK, LDN, LDN/NY, NY)
- Settings panel for simulation customization
- Sound effects for news, RFQs, and trades
- Game restart with current settings

## Sample Clients
- **MacroHard Corp** - Medium competitiveness, 5-25M, buys and sells
- **Bill's Bakery** - High competitiveness, 1-5M, always buys EUR
- **ABC Capital** - Low competitiveness (price sensitive), 10-50M, buys and sells
