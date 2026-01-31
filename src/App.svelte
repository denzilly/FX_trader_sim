<script lang="ts">
  import Hedging from './lib/components/Hedging.svelte';
  import EPricing from './lib/components/EPricing.svelte';
  import News from './lib/components/News.svelte';
  import TradeBlotter from './lib/components/TradeBlotter.svelte';
  import Chat from './lib/components/Chat.svelte';
  import RiskPnl from './lib/components/RiskPnl.svelte';
</script>

<main class="cockpit">
  <header class="cockpit-header">
    <h1>FX Trader Simulator</h1>
    <div class="pair-label">EUR/USD</div>
    <div class="clock">09:32:15</div>
  </header>

  <div class="cockpit-grid">
    <div class="grid-cell hedging-cell">
      <Hedging />
    </div>
    <div class="grid-cell epricing-cell">
      <EPricing />
    </div>
    <div class="grid-cell news-cell">
      <News />
    </div>
    <div class="grid-cell blotter-cell">
      <TradeBlotter />
    </div>
    <div class="grid-cell chat-cell">
      <Chat />
    </div>
    <div class="grid-cell risk-cell">
      <RiskPnl />
    </div>
  </div>
</main>

<style>
  .cockpit {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0f0f1a;
    color: #e0e0e0;
  }

  .cockpit-header {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 12px 20px;
    background: #1a1a2e;
    border-bottom: 1px solid #3a3a5a;
  }

  .cockpit-header h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #fff;
  }

  .pair-label {
    background: #2a4a6a;
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 14px;
  }

  .clock {
    margin-left: auto;
    font-family: 'Consolas', monospace;
    font-size: 14px;
    color: #888;
  }

  .cockpit-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    padding: 8px;
    min-height: 0;
  }

  .grid-cell {
    min-height: 0;
    overflow: hidden;
    display: flex;
  }

  .grid-cell > :global(*) {
    flex: 1;
  }

  /* Grid placement */
  .hedging-cell {
    grid-column: 1;
    grid-row: 1;
  }

  .epricing-cell {
    grid-column: 2;
    grid-row: 1;
  }

  .news-cell {
    grid-column: 3;
    grid-row: 1;
  }

  .blotter-cell {
    grid-column: 1;
    grid-row: 2;
  }

  .chat-cell {
    grid-column: 2;
    grid-row: 2;
  }

  .risk-cell {
    grid-column: 3;
    grid-row: 2;
  }
</style>
