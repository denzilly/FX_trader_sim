<script lang="ts">
  // Risk & PNL module - position and performance display
  const position = {
    amount: 15_000_000,
    side: 'LONG',
    currency: 'EUR'
  };

  const pnl = {
    realized: 12500,
    unrealized: -3200,
    total: 9300
  };
</script>

<div class="module risk-pnl">
  <div class="module-header">Risk & PNL</div>
  <div class="module-content">
    <div class="section">
      <div class="section-label">Position</div>
      <div class="position {position.side.toLowerCase()}">
        <span class="side">{position.side}</span>
        <span class="amount">{(position.amount / 1_000_000).toFixed(0)}M</span>
        <span class="currency">{position.currency}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-label">PNL</div>
      <div class="pnl-grid">
        <span class="label">Realized</span>
        <span class="value {pnl.realized >= 0 ? 'positive' : 'negative'}">
          ${pnl.realized.toLocaleString()}
        </span>

        <span class="label">Unrealized</span>
        <span class="value {pnl.unrealized >= 0 ? 'positive' : 'negative'}">
          ${pnl.unrealized.toLocaleString()}
        </span>

        <span class="label total-label">Total</span>
        <span class="value total {pnl.total >= 0 ? 'positive' : 'negative'}">
          ${pnl.total.toLocaleString()}
        </span>
      </div>
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
    gap: 16px;
  }

  .section-label {
    font-size: 10px;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .position {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 8px;
    border-radius: 4px;
  }

  .position.long {
    background: #2d4a3e;
  }

  .position.short {
    background: #4a2d3e;
  }

  .side {
    font-weight: 600;
    font-size: 12px;
  }

  .long .side {
    color: #4ade80;
  }

  .short .side {
    color: #f87171;
  }

  .amount {
    font-family: 'Consolas', monospace;
    font-size: 20px;
    font-weight: 600;
  }

  .currency {
    color: #888;
    font-size: 12px;
  }

  .pnl-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 12px;
    font-size: 12px;
  }

  .label {
    color: #888;
  }

  .value {
    font-family: 'Consolas', monospace;
    text-align: right;
  }

  .positive {
    color: #4ade80;
  }

  .negative {
    color: #f87171;
  }

  .total-label {
    font-weight: 600;
    color: #ccc;
    padding-top: 4px;
    border-top: 1px solid #3a3a5a;
  }

  .total {
    font-weight: 600;
    font-size: 14px;
    padding-top: 4px;
    border-top: 1px solid #3a3a5a;
  }
</style>
