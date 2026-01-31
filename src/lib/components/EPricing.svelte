<script lang="ts">
  import { ePrices, ePricingConfig } from '../stores/game';
  import { formatPrice } from '../utils/format';

  function widen() {
    ePricingConfig.update(c => ({ ...c, spreadPips: c.spreadPips + 1 }));
  }

  function tighten() {
    ePricingConfig.update(c => ({ ...c, spreadPips: Math.max(1, c.spreadPips - 1) }));
  }

  function skewLeft() {
    ePricingConfig.update(c => ({ ...c, skewPips: c.skewPips - 1 }));
  }

  function skewRight() {
    ePricingConfig.update(c => ({ ...c, skewPips: c.skewPips + 1 }));
  }

  function skewToMidBid() {
    // Skew so bid equals mid (extreme left skew)
    ePricingConfig.update(c => ({ ...c, skewPips: Math.floor(c.spreadPips / 2) }));
  }

  function skewToMidAsk() {
    // Skew so ask equals mid (extreme right skew)
    ePricingConfig.update(c => ({ ...c, skewPips: -Math.floor(c.spreadPips / 2) }));
  }
</script>

<div class="module e-pricing">
  <div class="module-header">e-Pricing</div>
  <div class="module-content">
    <button class="control-btn" on:click={widen}>WIDEN</button>

    <div class="price-display">
      <span class="bid-price">{formatPrice($ePrices.bid)}</span>
      <span class="spread">{$ePricingConfig.spreadPips}</span>
      <span class="ask-price">{formatPrice($ePrices.ask)}</span>
    </div>

    <button class="control-btn" on:click={tighten}>TIGHTEN</button>

    <div class="skew-controls">
      <button class="skew-btn" on:click={skewToMidBid}>MID</button>
      <button class="skew-btn" on:click={skewLeft}>←</button>
      <span class="skew-value">{$ePricingConfig.skewPips}</span>
      <button class="skew-btn" on:click={skewRight}>→</button>
      <button class="skew-btn" on:click={skewToMidAsk}>MID</button>
    </div>

    <div class="volume-ladder">
      <span>1M</span>
      <span>5M</span>
      <span>10M</span>
      <span>50M</span>
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
  }

  .module-content {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .control-btn {
    background: #2a2a4a;
    border: 1px solid #3a3a5a;
    color: #ccc;
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    width: 100%;
  }

  .control-btn:hover {
    background: #3a3a5a;
  }

  .price-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 0;
  }

  .bid-price, .ask-price {
    font-family: 'Consolas', monospace;
    font-size: 16px;
    padding: 8px 12px;
    border-radius: 4px;
  }

  .bid-price {
    background: #2d4a3e;
    color: #4ade80;
  }

  .ask-price {
    background: #4a2d3e;
    color: #f87171;
  }

  .spread {
    font-size: 11px;
    color: #888;
  }

  .skew-controls {
    display: flex;
    align-items: center;
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
    min-width: 24px;
    text-align: center;
  }

  .volume-ladder {
    display: flex;
    justify-content: center;
    gap: 8px;
    font-size: 11px;
    color: #666;
    margin-top: auto;
  }

  .volume-ladder span {
    padding: 4px 8px;
    background: #2a2a4a;
    border-radius: 2px;
    cursor: pointer;
  }

  .volume-ladder span:hover {
    background: #3a3a5a;
  }
</style>
