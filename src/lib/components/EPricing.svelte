<script lang="ts">
  import { eTierPrices, ePricingConfig } from '../stores/game';
  import { getBigFigure, getPips, formatSpreadPips } from '../utils/format';

  const TIERS = ['1', '5', '10', '50'] as const;
  type Tier = typeof TIERS[number];

  let selectedTier: Tier = '1';

  // Get prices for the selected tier
  $: selectedPrices = $eTierPrices[selectedTier];

  function adjustAddOn(tier: Tier, delta: number) {
    ePricingConfig.update(c => ({
      ...c,
      tierAddOnPips: {
        ...c.tierAddOnPips,
        [tier]: Math.max(0, c.tierAddOnPips[tier] + delta),
      },
    }));
  }

  function skewLeft() {
    ePricingConfig.update(c => ({ ...c, skewPips: c.skewPips - 1 }));
  }

  function skewRight() {
    ePricingConfig.update(c => ({ ...c, skewPips: c.skewPips + 1 }));
  }

  function skewToMidBid() {
    // Skew so bid equals mid (extreme left skew)
    const addOnPips = $ePricingConfig.tierAddOnPips[selectedTier];
    ePricingConfig.update(c => ({ ...c, skewPips: Math.floor(addOnPips / 2) }));
  }

  function skewToMidAsk() {
    // Skew so ask equals mid (extreme right skew)
    const addOnPips = $ePricingConfig.tierAddOnPips[selectedTier];
    ePricingConfig.update(c => ({ ...c, skewPips: -Math.floor(addOnPips / 2) }));
  }
</script>

<div class="module e-pricing">
  <div class="module-header">
    <span>e-Pricing</span>
    <select bind:value={selectedTier} class="tier-select">
      {#each TIERS as tier}
        <option value={tier}>{tier}M</option>
      {/each}
    </select>
  </div>

  <div class="module-content">
    <!-- Main price display -->
    <div class="main-prices">
      <div class="price-btn bid">
        <span class="big-figure">{getBigFigure(selectedPrices.bid)}</span>
        <span class="pips">{getPips(selectedPrices.bid)}</span>
        <span class="size-label">{selectedTier}M</span>
        <span class="side-label">Bid</span>
      </div>

      <div class="spread-display">
        <span class="spread-value">{formatSpreadPips(selectedPrices.spread)}</span>
      </div>

      <div class="price-btn offer">
        <span class="big-figure">{getBigFigure(selectedPrices.ask)}</span>
        <span class="pips">{getPips(selectedPrices.ask)}</span>
        <span class="size-label">{selectedTier}M</span>
        <span class="side-label">Offer</span>
      </div>
    </div>

    <!-- Skew controls -->
    <div class="skew-controls">
      <button class="skew-btn" on:click={skewToMidBid} title="Skew bid to mid">MID</button>
      <button class="skew-btn" on:click={skewLeft}>←</button>
      <span class="skew-value">{$ePricingConfig.skewPips >= 0 ? '+' : ''}{$ePricingConfig.skewPips}</span>
      <button class="skew-btn" on:click={skewRight}>→</button>
      <button class="skew-btn" on:click={skewToMidAsk} title="Skew offer to mid">MID</button>
    </div>

    <!-- Volume ladder with add-on spread controls -->
    <div class="volume-ladder">
      {#each TIERS as tier}
        {@const prices = $eTierPrices[tier]}
        <div class="ladder-row">
          <span class="ladder-price bid">
            <span class="tier-label">{tier}M</span>
            {getPips(prices.bid)}
          </span>
          <div class="addon-controls">
            <span class="spread-above">{formatSpreadPips(prices.spread)}</span>
            <div class="addon-buttons">
              <button class="addon-btn" on:click={() => adjustAddOn(tier, -1)}>−</button>
              <span class="addon-value">+{prices.addOnPips}</span>
              <button class="addon-btn" on:click={() => adjustAddOn(tier, 1)}>+</button>
            </div>
          </div>
          <span class="ladder-price offer">
            {getPips(prices.ask)}
            <span class="tier-label">{tier}M</span>
          </span>
        </div>
      {/each}
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

  /* Main price display */
  .main-prices {
    display: grid;
    grid-template-columns: 1fr 40px 1fr;
    gap: 4px;
    align-items: stretch;
  }

  .price-btn {
    position: relative;
    padding: 8px 12px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 70px;
  }

  .price-btn.bid {
    background: #4a2d3e;
    color: #f87171;
  }

  .price-btn.offer {
    background: #2d4a3e;
    color: #4ade80;
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

  /* Skew controls */
  .skew-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .skew-btn {
    background: #2a2a4a;
    border: 1px solid #3a3a5a;
    color: #ccc;
    padding: 4px 8px;
    border-radius: 2px;
    cursor: pointer;
    font-size: 10px;
  }

  .skew-btn:hover {
    background: #3a3a5a;
  }

  .skew-value {
    font-family: 'Consolas', monospace;
    min-width: 32px;
    text-align: center;
    font-size: 11px;
    color: #888;
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
    grid-template-columns: 1fr 70px 1fr;
    gap: 4px;
    align-items: center;
  }

  .ladder-price {
    font-family: 'Consolas', monospace;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .ladder-price.bid {
    background: #3a2232;
    color: #f87171;
  }

  .ladder-price.offer {
    background: #223a32;
    color: #4ade80;
  }

  .ladder-price .tier-label {
    font-size: 9px;
    color: #888;
    opacity: 0.8;
  }

  .addon-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
  }

  .spread-above {
    font-size: 10px;
    color: #888;
    font-family: 'Consolas', monospace;
  }

  .addon-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .addon-btn {
    background: #2a2a4a;
    border: 1px solid #3a3a5a;
    color: #888;
    width: 18px;
    height: 18px;
    border-radius: 2px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .addon-btn:hover {
    background: #3a3a5a;
    color: #ccc;
  }

  .addon-value {
    font-family: 'Consolas', monospace;
    font-size: 10px;
    color: #60a5fa;
    min-width: 24px;
    text-align: center;
  }
</style>
