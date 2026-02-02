<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { startGame, stopGame } from './lib/simulation/gameLoop';
  import { position, pnl, marketImpact, gameTime, currentSession } from './lib/stores/game';
  import { formatCurrency } from './lib/utils/format';
  import Hedging from './lib/components/Hedging.svelte';
  import EPricing from './lib/components/EPricing.svelte';
  import Chart from './lib/components/Chart.svelte';
  import TradeBlotter from './lib/components/TradeBlotter.svelte';
  import RfqBlotter from './lib/components/RfqBlotter.svelte';
  import Chat from './lib/components/Chat.svelte';
  import NewsEvents from './lib/components/NewsEvents.svelte';
  import Settings from './lib/components/Settings.svelte';

  let settingsOpen = false;

  onMount(() => {
    startGame();
  });

  onDestroy(() => {
    stopGame();
  });

  $: positionSide = $position.amount > 0 ? 'LONG' : $position.amount < 0 ? 'SHORT' : 'FLAT';
  $: positionAmount = Math.abs($position.amount);

  $: formattedTime = $gameTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Session flag emojis
  $: sessionFlags = {
    'TK': '🇯🇵',
    'LDN': '🇬🇧',
    'LDN/NY': '🇬🇧🇺🇸',
    'NY': '🇺🇸',
  }[$currentSession.name] || '🌐';
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
            {positionSide} {positionAmount}M EUR
          {/if}
        </span>
      </div>

      <div class="stat pnl-stat {$pnl.total >= 0 ? 'positive' : 'negative'}">
        <span class="stat-label">PnL</span>
        <span class="stat-value">{formatCurrency($pnl.total)}</span>
      </div>

      <div class="stat impact-stat {$marketImpact > 0 ? 'positive' : $marketImpact < 0 ? 'negative' : ''}">
        <span class="stat-label">Impact</span>
        <span class="stat-value">{$marketImpact >= 0 ? '+' : ''}{$marketImpact.toFixed(2)} pips</span>
      </div>
    </div>

    <div class="clock-session">
      <div class="clock">{formattedTime}</div>
      <div class="session-indicator">
        <span class="session-flags">{sessionFlags}</span>
        <span class="session-name">{$currentSession.name}</span>
      </div>
    </div>
    <button class="settings-btn" on:click={() => settingsOpen = true} title="Settings">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </header>

  <div class="cockpit-grid">
    <div class="grid-cell hedging-cell">
      <Hedging />
    </div>
    <div class="grid-cell epricing-cell">
      <EPricing />
    </div>
    <div class="grid-cell news-cell">
      <NewsEvents />
    </div>
    <div class="grid-cell chart-cell">
      <Chart />
    </div>
    <div class="grid-cell blotter-cell">
      <TradeBlotter />
    </div>
    <div class="grid-cell rfq-blotter-cell">
      <RfqBlotter />
    </div>
    <div class="grid-cell chat-cell">
      <Chat />
    </div>
  </div>
</main>

<Settings bind:isOpen={settingsOpen} />

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

  .impact-stat {
    background: #2a2a4a;
  }

  .impact-stat.positive .stat-value {
    color: #4ade80;
  }

  .impact-stat.negative .stat-value {
    color: #f87171;
  }

  .clock-session {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 16px;
  }

  .clock {
    font-family: 'Consolas', monospace;
    font-size: 14px;
    color: #888;
  }

  .session-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #2a2a4a;
    padding: 4px 10px;
    border-radius: 4px;
  }

  .session-flags {
    font-size: 14px;
    line-height: 1;
  }

  .session-name {
    font-size: 11px;
    font-weight: 600;
    color: #60a5fa;
    letter-spacing: 0.5px;
  }

  .settings-btn {
    background: #2a2a4a;
    border: 1px solid #3a3a5a;
    border-radius: 4px;
    padding: 6px 8px;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  }

  .settings-btn:hover {
    background: #3a3a5a;
    color: #fff;
  }

  .cockpit-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr 2fr 2fr;
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

  .chart-cell {
    grid-column: 4;
    grid-row: 1;
  }

  .blotter-cell {
    grid-column: 1 / 3;
    grid-row: 2;
  }

  .rfq-blotter-cell {
    grid-column: 3;
    grid-row: 2;
  }

  .chat-cell {
    grid-column: 4;
    grid-row: 2;
  }
</style>
