<script lang="ts">
  // Electronic Pricing module - configure streaming prices
  let skew = 0;
</script>

<div class="module e-pricing">
  <div class="module-header">e-Pricing</div>
  <div class="module-content">
    <button class="control-btn">WIDEN</button>

    <div class="price-display">
      <span class="bid-price">1.0848</span>
      <span class="spread">1.2</span>
      <span class="ask-price">1.0860</span>
    </div>

    <button class="control-btn">TIGHTEN</button>

    <div class="skew-controls">
      <button class="skew-btn">MID</button>
      <button class="skew-btn">←</button>
      <span class="skew-value">{skew}</span>
      <button class="skew-btn">→</button>
      <button class="skew-btn">MID</button>
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
