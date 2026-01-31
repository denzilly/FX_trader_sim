# Introduction

 

We will build a game about FX Spot market making, to teach the world how it feels to do the pricing and risk management of a financial markets product. Players will act as the spot trader of a bank's FX market making desk, and be responsible for pricing both manual and electronic FX spot quotes.

 

The goal of the game is as follows:

- Players act as the FX spot trader of a bank's FX market making desk and will have a number of KPIs to fulfil:

                - Number of clients successfully quoted, number of times the client actually traded

                - Total PNL

                - How much risk they took on their books (need to think about how to score this, perhaps PNL volatility?)


- Players will have to manage both manual and electronic quoting of their product.
- Players will trade in the market themselves to manage their risk, or can aggressively skew their pricing to get out of their positions
- In this simulated market, prices are constantly moving based on what is happening in the news, but also flows going through the market. If the player decides to sell very aggressively, the market will likely move down.

 

 

# Game logic 

## Market Price Engine

There is only a single asset class available in the game: EUR/USD.
The market price engine is responsible for simulating price development in this currency pair.

We essentially assume that the mid-market price follows a random walk with drift, but can additionally be influenced due to a number of exogenous factors:
- market impact from trading. Performing several large trades in the market yourself as a trader can move the market.
- market impact from client quote. Certain clients are assumed to be generating market impact because they ask a large number of banks for a price. We will assume that the more banks a client is asking, the larger the potential market impact (number of banks being asked will be a static range per client: e.g. client ABC corp always asks between 5-15 banks, bill's bakery always asks only 3-5). If a client is asking only you for a price (1) then there is no market impact from the client quote.
- Incoming news will move the market. Incoming news can be random geopolitical events, but also scheduled economic data releases (NFP, CPI, etc)

Market spreads will also move depending on certain conditions, primarily:
- TIme of day (spreads will be tighest during london business hours)

## Pricing and Trading

The player has a position (long/short eurusd) and PNL at any point in time, based on trading results and current market price.
The player works for the bank, and has two ways of accumulating a risk posiiton (and therefore PNL)

    1. Pricing client trades, and winning deals.
        a. Electronically priced deals where clients themselves perform an RFQ (request for quote) and ask to either Buy or sell EUR or USD. An RFQ is a request that lasts a number of seconds. The electronic pricing stream configured by the player automatically sends a price to the client. Depending on how competitive the client is, they may accept or reject the price (deal or no-deal). Competitiveness is a static configuration per client, as is the range of time that a client will wait for a quote, and the size/side they are interested in trading.

        b. Voice deals, where a sales person asks the trader for a price via the chat. The same client specific parameters apply. The trader has to respond with a price in the chat window. If the deal is done, it will appear in the blotter alongside the electronic trades

    2. Aggressing the market themselves, buying or selling eurusd to create or reduce a risk position.

## Clients

Clients request prices from and trade with, the bank that the client is representing in the game. Clients demonstrate behaviour according to a set of parameters that varies per client. 

- Competitiveness: willingness of a client to trade depending on distance of price from mid
- Patience: how long a client will be willing to wait before deciding to accept/reject a price. For voice, not providing a price counts as a rejection. (e.g. 10-30 seconds)
- size: Size range a client will request (e.g. 10-30 mln)
- Direction: whether a client is always a buyer/seller of euros/dollars or could do either
- Frequency: how often a client will ask for a price



# GUI Modules

 

The game will consist of six separate GUI modules, which we'll call the cockpit.

 

## Hedging

 

The hedging module shows the current market prices at which the trader can hedge their own position.
There is a clickable area at the top for the main trading interface.
There are additional smaller clickable buttons for each volume ladder (1m 5m, 10m and 50m).
The market price is fed by the market price engine, see that section for details.

 

## e-Pricing


The e-Pricing module allows the trader to set their electronic pricing. The electronic pricing is based on the market pricing plus an additional spread, configured in PIPS.
The e-Pricing shows the current electronic price being streamed to clients for 1mln, as well as a volume ladder underneath for 1M, 5M, 10M, and 50M.

 
Above the 1mln price, there is a button to WIDEN, which will widen the 1mln price by 1 pip on each side.
Below the 1mln price, there is a button to tighten, which will tighten the 1mln price by 1 pip on each side.


Below the tighten button there are two arrow buttons and two MID buttons [MID] <- 0 -> [MID] to skew the price left or right by one pip. The value in the middle shows current skew in pips. There is also the option to skew price completely to mid. in that case the offer or bid will always match the market mid rate.

The skew will apply to all price tiers the same way, moving price per pip left or right (might want to improve this somehow.

## NEWS

News feed will follow a Bloomberg HOT style line by line of incoming news with audio alerts.
Incoming market news will have the potential to move the market.

 
## Trade Blotter

 

Trade blotter will show active electronic requests from clients, as well as all done deals
The trade blotter will have a number of columns showing price, client name, voice/electronic, size, direction
While a trade is being electronically quoted, the trader will have the ability to reject a certain price from going through by clicking reject.
The blotter does not need to be filterable or have customizable columns, but you should be able to scroll down to see previous trades.
New electronic trade requests (or executed voice trades) will appear at the top of the blotter.
Electronic trade requests can be rejected by clicking on a reject button in the first column of the blotter.
 

 

## Chat

 

The chat functionality will be multipurpose, but primarily used for quoting voice tickets.

Sales people will ask the traders for prices for clients, such as: I need a bid in 10 for macrohard software

The trader can then respond with: 1.1960

The trader can also care his price by saying: care, ref, any number of e's lik eeeee, or off

 

 

## Risk & PNL

 

The final area shows the current risk position, and current book PNL




# Future ideas
- make the game multiplayer, such that traders behaviour influences the market for everyone--there is one shared market price that can be influenced through market impact, and traders can even be competing for the same flow.

- Allow traders to implement an auto-quote limit for electronic trading. i.e. only trades up to 50m are automatically quoted, above that they have the ability to review priicng before clicking

- make not providing a price even worse than getting rejected for a bad price

- allow the user to block clients known for doing shit behaviour like machine gunning in tickets of 10mln back to back (creating massive market impact)