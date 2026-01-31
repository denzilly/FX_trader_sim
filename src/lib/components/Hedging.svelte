<script lang="ts">
  // Hedging module - market trading interface
</script>

<div class="module hedging">
  <div class="module-header">Hedging</div>
  <div class="module-content">
    <div class="price-display">
      <button class="bid-price">1.0850</button>
      <span class="spread">0.8</span>
      <button class="ask-price">1.0858</button>
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
    gap: 12px;
  }

  .price-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .bid-price, .ask-price {
    font-family: 'Consolas', monospace;
    font-size: 20px;
    padding: 12px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    min-width: 100px;
  }

  .bid-price {
    background: #2d4a3e;
    color: #4ade80;
  }

  .bid-price:hover {
    background: #3d5a4e;
  }

  .ask-price {
    background: #4a2d3e;
    color: #f87171;
  }

  .ask-price:hover {
    background: #5a3d4e;
  }

  .spread {
    font-size: 12px;
    color: #888;
  }

  .volume-ladder {
    display: flex;
    justify-content: center;
    gap: 8px;
    font-size: 11px;
    color: #666;
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
