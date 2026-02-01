<script lang="ts">
  import { newsHistory, upcomingRelease, gameTime } from '../stores/game';

  function formatGameTime(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  function getTimeUntilRelease(scheduledMinutes: number): string {
    const currentMinutes = $gameTime.getHours() * 60 + $gameTime.getMinutes();
    const diff = scheduledMinutes - currentMinutes;
    if (diff <= 0) return 'NOW';
    if (diff < 60) return `${diff}m`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  }

  $: currentGameMinutes = $gameTime.getHours() * 60 + $gameTime.getMinutes();
</script>

<div class="module news-events">
  <div class="module-header">News & Events</div>
  <div class="module-content">
    <!-- News list -->
    <div class="news-list">
      {#if $newsHistory.length === 0}
        <div class="empty-state">No news yet...</div>
      {:else}
        {#each $newsHistory.slice(0, 20) as item (item.id)}
          <div class="news-item {item.direction} {item.type}">
            <span class="news-time">{formatGameTime(item.timestamp)}</span>
            <span class="news-headline">{item.headline}</span>
            {#if item.type === 'release'}
              <span class="news-impact release-impact {item.direction}">
                {item.direction === 'bullish' ? '+' : '-'}{item.impactPips.toFixed(0)}
              </span>
            {:else}
              <span class="news-impact {item.direction}">
                {item.direction === 'bullish' ? '+' : '-'}{item.impactPips}
              </span>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <!-- Upcoming release -->
    {#if $upcomingRelease}
      <div class="upcoming-section">
        <div class="upcoming-header">
          <span class="upcoming-label">UPCOMING</span>
          <span class="upcoming-countdown">{getTimeUntilRelease($upcomingRelease.scheduledGameMinutes)}</span>
        </div>
        <div class="upcoming-details">
          <span class="upcoming-time">{formatGameTime($upcomingRelease.scheduledGameMinutes)}</span>
          <span class="upcoming-name">{$upcomingRelease.type.name}</span>
        </div>
        <div class="upcoming-expected">
          Expected: <span class="expected-value">{$upcomingRelease.expected}{$upcomingRelease.type.unit}</span>
        </div>
      </div>
    {:else}
      <div class="upcoming-section empty">
        <div class="upcoming-header">
          <span class="upcoming-label">UPCOMING</span>
        </div>
        <div class="no-releases">No releases scheduled</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .module {
    background: #1a1a2e;
    border: 1px solid #3a3a5a;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    height: 100%;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .news-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .empty-state {
    color: #666;
    font-style: italic;
    text-align: center;
    padding: 20px;
    font-size: 12px;
  }

  .news-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 8px;
    margin-bottom: 4px;
    border-radius: 3px;
    font-size: 11px;
    background: #1e1e32;
  }

  .news-item.release {
    background: #1e2e3e;
    border-left: 2px solid #60a5fa;
  }

  .news-item.bullish {
    border-left: 2px solid #4ade80;
  }

  .news-item.bearish {
    border-left: 2px solid #f87171;
  }

  .news-time {
    font-family: 'Consolas', monospace;
    color: #666;
    min-width: 40px;
    flex-shrink: 0;
  }

  .news-headline {
    flex: 1;
    color: #ccc;
    line-height: 1.3;
  }

  .news-impact {
    font-family: 'Consolas', monospace;
    font-weight: 600;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .news-impact.bullish {
    color: #4ade80;
    background: #1a3a2a;
  }

  .news-impact.bearish {
    color: #f87171;
    background: #3a1a2a;
  }

  .news-impact.release-impact {
    font-size: 11px;
  }

  /* Upcoming section */
  .upcoming-section {
    border-top: 1px solid #3a3a5a;
    padding: 10px 12px;
    background: #1e1e32;
  }

  .upcoming-section.empty {
    opacity: 0.6;
  }

  .upcoming-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .upcoming-label {
    font-size: 9px;
    font-weight: 600;
    color: #f59e0b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .upcoming-countdown {
    font-family: 'Consolas', monospace;
    font-size: 12px;
    color: #f59e0b;
    font-weight: 600;
  }

  .upcoming-details {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin-bottom: 4px;
  }

  .upcoming-time {
    font-family: 'Consolas', monospace;
    font-size: 12px;
    color: #888;
  }

  .upcoming-name {
    font-size: 11px;
    color: #ccc;
    font-weight: 500;
  }

  .upcoming-expected {
    font-size: 10px;
    color: #888;
  }

  .expected-value {
    font-family: 'Consolas', monospace;
    color: #60a5fa;
  }

  .no-releases {
    font-size: 11px;
    color: #666;
    font-style: italic;
  }
</style>
