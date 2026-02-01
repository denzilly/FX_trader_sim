<script lang="ts">
  import { tierPrices, twapState } from '../stores/game';
  import { executeHedgeTrade, startTwap, stopTwap } from '../simulation/gameLoop';
  import { getBigFigure, getPips, formatSpreadPips } from '../utils/format';

  const TIERS = [1, 5, 10, 50] as const;
  type Tier = typeof TIERS[number];

  let selectedTier: Tier = 1;

  // TWAP parameters
  let twapSide: 'buy' | 'sell' = 'buy';
  let twapTotalSize = 10;
  let twapSizePerInterval = 1;

  // Computed progress
  $: twapProgress = $twapState.totalSize > 0
    ? ($twapState.filledSize / $twapState.totalSize) * 100
    : 0;

  function handleActivateTwap() {
    startTwap(twapSide, twapTotalSize, twapSizePerInterval);
  }

  function handleCancelTwap() {
    stopTwap();
  }

  // Get prices for the selected tier
  $: selectedPrices = $tierPrices[selectedTier.toString() as '1' | '5' | '10' | '50'];

  function handleSell(size: number) {
    const prices = $tierPrices[size.toString() as '1' | '5' | '10' | '50'];
    executeHedgeTrade('sell', size, prices.bid);
  }

  function handleBuy(size: number) {
    const prices = $tierPrices[size.toString() as '1' | '5' | '10' | '50'];
    executeHedgeTrade('buy', size, prices.ask);
  }
</script>

<div class="module hedging">
  <div class="module-header">
    <span>Hedging</span>
    <select bind:value={selectedTier} class="tier-select">
      {#each TIERS as tier}
        <option value={tier}>{tier}M</option>
      {/each}
    </select>
  </div>

  <div class="module-content">
    <!-- Main price buttons -->
    <div class="main-prices">
      <button class="price-btn sell" on:click={() => handleSell(selectedTier)}>
        <span class="big-figure">{getBigFigure(selectedPrices.bid)}</span>
        <span class="pips">{getPips(selectedPrices.bid)}</span>
        <span class="size-label">{selectedTier}M</span>
        <span class="side-label">Bid</span>
      </button>

      <div class="spread-display">
        <span class="spread-value">{formatSpreadPips(selectedPrices.spread)}</span>
      </div>

      <button class="price-btn buy" on:click={() => handleBuy(selectedTier)}>
        <span class="big-figure">{getBigFigure(selectedPrices.ask)}</span>
        <span class="pips">{getPips(selectedPrices.ask)}</span>
        <span class="size-label">{selectedTier}M</span>
        <span class="side-label">Offer</span>
      </button>
    </div>

    <!-- Volume ladder -->
    <div class="volume-ladder">
      {#each TIERS as tier}
        {@const prices = $tierPrices[tier.toString() as '1' | '5' | '10' | '50']}
        <div class="ladder-row">
          <button class="ladder-btn sell" on:click={() => handleSell(tier)}>
            <span class="tier-label">{tier}M</span>
            {getPips(prices.bid)}
          </button>
          <span class="ladder-spread">{formatSpreadPips(prices.spread)}</span>
          <button class="ladder-btn buy" on:click={() => handleBuy(tier)}>
            {getPips(prices.ask)}
            <span class="tier-label">{tier}M</span>
          </button>
        </div>
      {/each}
    </div>

    <!-- TWAP Algo Section -->
    <div class="twap-section">
      <div class="twap-header">TWAP Algo</div>
      {#if !$twapState.active}
        <div class="twap-params">
          <div class="param-row">
            <label>Side</label>
            <select bind:value={twapSide} class="twap-select">
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div class="param-row">
            <label>Total Size</label>
            <input type="number" bind:value={twapTotalSize} min="1" max="100" class="twap-input" />
            <span class="unit">M</span>
          </div>
          <div class="param-row">
            <label>Per 10s</label>
            <input type="number" bind:value={twapSizePerInterval} min="1" max="10" class="twap-input" />
            <span class="unit">M</span>
          </div>
          <button class="twap-activate" on:click={handleActivateTwap}>Activate</button>
        </div>
      {:else}
        <div class="twap-active">
          <div class="twap-info">
            <span class="twap-side {$twapState.side}">{$twapState.side.toUpperCase()}</span>
            <span class="twap-filled">{$twapState.filledSize}M / {$twapState.totalSize}M</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill {$twapState.side}" style="width: {twapProgress}%"></div>
          </div>
          <button class="twap-cancel" on:click={handleCancelTwap}>Cancel</button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .module {
    background: #1a1a2e;
    border: 1px solid #3a3a5a;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
  }

  .module-header {
    background: #2a2a4a;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #3a3a5a;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tier-select {
    background: #1a1a2e;
    border: 1px solid #3a3a5a;
    color: #ccc;
    padding: 2px 8px;
    border-radius: 2px;
    font-size: 11px;
    cursor: pointer;
  }

  .module-content {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Main price buttons - aligned with ladder */
  .main-prices {
    display: grid;
    grid-template-columns: 1fr 40px 1fr;
    gap: 4px;
    align-items: stretch;
  }

  .price-btn {
    position: relative;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 70px;
  }

  .price-btn.sell {
    background: #4a2d3e;
    color: #f87171;
  }

  .price-btn.sell:hover {
    background: #5a3d4e;
  }

  .price-btn.buy {
    background: #2d4a3e;
    color: #4ade80;
  }

  .price-btn.buy:hover {
    background: #3d5a4e;
  }

  .big-figure {
    position: absolute;
    top: 4px;
    left: 8px;
    font-size: 11px;
    font-family: 'Consolas', monospace;
    opacity: 0.8;
  }

  .pips {
    font-family: 'Consolas', monospace;
    font-size: 32px;
    font-weight: 600;
    line-height: 1;
    margin-top: 8px;
  }

  .size-label {
    position: absolute;
    top: 4px;
    right: 8px;
    font-size: 10px;
    opacity: 0.7;
  }

  .side-label {
    font-size: 10px;
    text-transform: uppercase;
    opacity: 0.7;
    margin-top: 4px;
  }

  .spread-display {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spread-value {
    font-size: 12px;
    color: #666;
  }

  /* Volume ladder */
  .volume-ladder {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-top: 4px;
  }

  .ladder-row {
    display: grid;
    grid-template-columns: 1fr 40px 1fr;
    gap: 4px;
    align-items: center;
  }

  .ladder-btn {
    position: relative;
    font-family: 'Consolas', monospace;
    font-size: 12px;
    padding: 4px 8px;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .ladder-btn.sell {
    background: #3a2232;
    color: #f87171;
    flex-direction: row;
  }

  .ladder-btn.sell:hover {
    background: #4a3242;
  }

  .ladder-btn.buy {
    background: #223a32;
    color: #4ade80;
    flex-direction: row;
  }

  .ladder-btn.buy:hover {
    background: #324a42;
  }

  .ladder-btn .tier-label {
    font-size: 9px;
    color: #888;
    opacity: 0.8;
  }

  .ladder-spread {
    font-size: 9px;
    color: #555;
    text-align: center;
  }

  /* TWAP Section */
  .twap-section {
    border-top: 1px solid #3a3a5a;
    padding-top: 12px;
    margin-top: 8px;
  }

  .twap-header {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 8px;
  }

  .twap-params {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .param-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .param-row label {
    font-size: 11px;
    color: #888;
    width: 70px;
  }

  .twap-select,
  .twap-input {
    background: #2a2a4a;
    border: 1px solid #3a3a5a;
    color: #ccc;
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 11px;
    width: 70px;
  }

  .twap-input {
    width: 50px;
    text-align: right;
  }

  .unit {
    font-size: 10px;
    color: #666;
  }

  .twap-activate {
    background: #3a4a6a;
    border: none;
    color: #60a5fa;
    padding: 8px 16px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    margin-top: 6px;
  }

  .twap-activate:hover {
    background: #4a5a7a;
  }

  .twap-active {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .twap-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .twap-side {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 2px;
  }

  .twap-side.buy {
    background: #2d4a3e;
    color: #4ade80;
  }

  .twap-side.sell {
    background: #4a2d3e;
    color: #f87171;
  }

  .twap-filled {
    font-size: 11px;
    font-family: 'Consolas', monospace;
    color: #ccc;
  }

  .progress-bar {
    height: 8px;
    background: #2a2a4a;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .progress-fill.buy {
    background: linear-gradient(90deg, #22c55e, #4ade80);
  }

  .progress-fill.sell {
    background: linear-gradient(90deg, #ef4444, #f87171);
  }

  .twap-cancel {
    background: #4a2d3e;
    border: none;
    color: #f87171;
    padding: 6px 12px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .twap-cancel:hover {
    background: #5a3d4e;
  }
</style>
