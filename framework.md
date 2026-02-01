# FX Trader Simulator - Design Document

## Introduction

We will build a game about FX Spot market making, to teach the world how it feels to do the pricing and risk management of a financial markets product. Players will act as the spot trader of a bank's FX market making desk, and be responsible for pricing both manual and electronic FX spot quotes.

## Game Goals

Players act as the FX spot trader of a bank's FX market making desk with KPIs to fulfil:
- Number of clients successfully quoted, number of times the client actually traded
- Total PnL
- How much risk they took on their books (need to think about scoring - perhaps PnL volatility?)

Players will:
- Manage both manual and electronic quoting
- Trade in the market to manage risk, or aggressively skew pricing to exit positions
- React to a simulated market where prices move based on news and flows

---

# Game Logic

## Market Price Engine [IMPLEMENTED]

There is only a single asset class available: EUR/USD.

The mid-market price follows a random walk with drift, influenced by:
- [x] Random walk with mean reversion
- [ ] Market impact from trading (large trades move the market)
- [ ] Market impact from client quotes (clients asking many banks = more impact)
- [ ] Incoming news events (geopolitical, economic data releases)

Market spreads move depending on:
- [x] Tiered pricing (1M, 5M, 10M, 50M with different spreads)
- [x] Volatility factor (spreads widen with volatility)
- [ ] Time of day (tightest during London hours)

## Pricing and Trading [IMPLEMENTED]

The player has a position (long/short EURUSD) and PnL at any point in time.

Two ways to accumulate a risk position:

1. **Pricing client trades and winning deals:**
   - [x] **Electronic deals**: Clients perform RFQs, e-pricing stream auto-quotes. Client competitiveness determines accept/reject.
   - [x] **Voice deals**: Salesperson asks via chat, trader responds with price. Same client parameters apply.

2. **Aggressing the market:**
   - [x] Buy/sell EURUSD via hedging panel to create or reduce risk position

## Clients [IMPLEMENTED]

Clients demonstrate behaviour according to parameters:

| Parameter | Description | Implemented |
|-----------|-------------|-------------|
| Competitiveness | Willingness to trade based on distance from mid | Yes |
| Patience | How long before accepting/rejecting (e.g., 5-15 seconds) | Yes |
| Size | Size range for requests (e.g., 10-30M) | Yes |
| Direction | Always buyer, always seller, or either | Yes |
| Frequency | How often they ask for prices | Yes |
| Banks Asked | Number of banks being asked (affects market impact) | Defined, not used |

### Sample Clients

- **MacroHard Corp**: Competitiveness 0.7, patience 5-10s, size 5-25M, direction both
- **Bill's Bakery**: Competitiveness 0.9, patience 5-15s, size 1-5M, direction buy only
- **ABC Capital**: Competitiveness 0.4, patience 5-10s, size 10-50M, direction both

---

# GUI Modules

The game consists of six GUI modules arranged in a 3x2 cockpit grid.

## Hedging [IMPLEMENTED]

Shows market prices at which the trader can hedge their position.
- [x] Main trading interface with bid/ask display
- [x] Size ladder for 1M, 5M, 10M, 50M trades
- [x] Live ticking prices from market engine
- [x] Click to execute hedge trades

## E-Pricing [IMPLEMENTED]

Allows trader to configure electronic pricing.
- [x] Shows current e-price being streamed (based on market + spread + skew)
- [x] WIDEN button: Increase spread by 1 pip per side
- [x] TIGHTEN button: Decrease spread by 1 pip per side
- [x] Skew controls: Shift bid/ask left or right by 1 pip
- [x] Current skew display
- [ ] Volume ladder showing prices for 1M, 5M, 10M, 50M
- [ ] Skew to MID option (offer or bid matches market mid)

## Chart [IMPLEMENTED]

- [x] Live EUR/USD price chart
- [x] 60 seconds of price history before scrolling
- [x] Current price indicator with label
- [ ] Trade markers showing where trades executed

## Trade Blotter [IMPLEMENTED]

Shows all executed trades.
- [x] Columns: Time, Client, Side, Size, Price, Type
- [x] Trade types: hedge, voice, electronic
- [x] Newest trades at top
- [x] Scrollable history
- [ ] Active electronic requests with reject button (moved to RFQ Blotter)
- [ ] Filterable columns

## RFQ Blotter [IMPLEMENTED]

Shows electronic RFQ requests.
- [x] Live pricing from e-pricing stream
- [x] Shows: Client, BID/OFFER, Size, Price, Time remaining
- [x] Reject/pass button on active RFQs
- [x] Status indicators (quoting, traded, passed, expired)
- [x] Green highlight for traded RFQs

## Chat [IMPLEMENTED]

Used for voice RFQ quoting.
- [x] Salespeople ask for prices: "I need a bid in 10 for MacroHard"
- [x] Trader responds with price: "1.0850" or just pips: "50"
- [x] Call off with: care, ref, eee, off
- [x] RFQ ACTIVE indicator when quote pending
- [x] MINE!/YOURS! responses when trades execute
- [x] Pips shown in done messages: "MINE at 55!"

## Risk & PnL [IMPLEMENTED - in header]

- [x] Current position display (LONG/SHORT/FLAT with size)
- [x] Current PnL (color-coded positive/negative)
- [ ] Separate detailed panel with realized/unrealized breakdown

## News [NOT IMPLEMENTED]

- [ ] Bloomberg HOT style line-by-line news feed
- [ ] Audio alerts for incoming news
- [ ] News events that move market prices

---

# Voice RFQ Flow

1. Salesperson posts in chat: "MacroHard is looking to buy 10m EURUSD, what's your offer?"
2. "RFQ ACTIVE" indicator appears
3. Player types price (full or pips only)
4. Client evaluates based on competitiveness and spread from mid
5. If accepted: "MINE at 55!" - trade executed, position updated
6. If rejected: "Nothing there" / "Traded away"
7. Player can call off: "care" -> "Ok, I'll tell them you're off"

---

# Electronic RFQ Flow

1. Client generates RFQ (random interval, based on frequency config)
2. RFQ appears in RFQ Blotter with live e-pricing
3. Price updates in real-time from e-pricing stream
4. Player can pass/reject before expiry
5. At expiry, client evaluates based on competitiveness
6. If traded: Row turns green, "DONE" status, trade added to blotter
7. Old RFQs cleaned up after 30 seconds

---

# Future Ideas

- [ ] Multiplayer with shared market impact
- [ ] Auto-quote limit (only auto-quote up to certain size)
- [ ] Penalty for not providing prices (worse than rejection)
- [ ] Client blocking for problematic behavior (machine-gunning)
- [ ] Market impact from player trades
- [ ] Market impact from client multi-bank quotes
- [ ] Scheduled economic data releases
- [ ] Time-of-day spread effects
- [ ] End-of-day scoring and leaderboards
