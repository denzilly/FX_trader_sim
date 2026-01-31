<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { startGame, stopGame } from './lib/simulation/gameLoop';
  import { position, pnl } from './lib/stores/game';
  import { formatMillions, formatCurrency } from './lib/utils/format';
  import Hedging from './lib/components/Hedging.svelte';
  import EPricing from './lib/components/EPricing.svelte';
  import Chart from './lib/components/Chart.svelte';
  import TradeBlotter from './lib/components/TradeBlotter.svelte';
  import Chat from './lib/components/Chat.svelte';
  import News from './lib/components/News.svelte';

  onMount(() => {
    startGame();
  });

  onDestroy(() => {
    stopGame();
  });

  $: positionSide = $position.amount > 0 ? 'LONG' : $position.amount < 0 ? 'SHORT' : 'FLAT';
  $: positionAmount = Math.abs($position.amount);
</script>

<main class="cockpit">
  <header class="cockpit-header">
    <h1>FX Trader Simulator</h1>
    <div class="pair-label">EUR/USD</div>

    <div class="header-stats">
      <div class="stat position-stat {positionSide.toLowerCase()}">
        <span class="stat-label">Position</span>
        <span class="stat-value">
          {#if positionAmount === 0}
            FLAT
          {:else}
            {positionSide} {formatMillions(positionAmount)} EUR
          {/if}
        </span>
      </div>

      <div class="stat pnl-stat {$pnl.total >= 0 ? 'positive' : 'negative'}">
        <span class="stat-label">PnL</span>
        <span class="stat-value">{formatCurrency($pnl.total)}</span>
      </div>
    </div>

    <div class="clock">09:32:15</div>
  </header>

  <div class="cockpit-grid">
    <div class="grid-cell hedging-cell">
      <Hedging />
    </div>
    <div class="grid-cell epricing-cell">
      <EPricing />
    </div>
    <div class="grid-cell chart-cell">
      <Chart />
    </div>
    <div class="grid-cell blotter-cell">
      <TradeBlotter />
    </div>
    <div class="grid-cell chat-cell">
      <Chat />
    </div>
    <div class="grid-cell news-cell">
      <News />
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
    gap: 16px;
    padding: 10px 20px;
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

  .header-stats {
    display: flex;
    gap: 16px;
    margin-left: auto;
  }

  .stat {
    display: flex;
    flex-direction: column;
    padding: 4px 12px;
    border-radius: 4px;
    min-width: 120px;
  }

  .stat-label {
    font-size: 9px;
    text-transform: uppercase;
    color: #888;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-family: 'Consolas', monospace;
    font-size: 13px;
    font-weight: 600;
  }

  .position-stat {
    background: #2a2a4a;
  }

  .position-stat.long .stat-value {
    color: #4ade80;
  }

  .position-stat.short .stat-value {
    color: #f87171;
  }

  .position-stat.flat .stat-value {
    color: #888;
  }

  .pnl-stat {
    background: #2a2a4a;
  }

  .pnl-stat.positive .stat-value {
    color: #4ade80;
  }

  .pnl-stat.negative .stat-value {
    color: #f87171;
  }

  .clock {
    font-family: 'Consolas', monospace;
    font-size: 14px;
    color: #888;
    margin-left: 16px;
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

  .chart-cell {
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

  .news-cell {
    grid-column: 3;
    grid-row: 2;
  }
</style>
