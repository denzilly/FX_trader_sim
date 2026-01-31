<script lang="ts">
  // News feed module - Bloomberg-style news ticker
  const newsItems = [
    { time: '09:32:15', text: 'ECB OFFICIAL: INFLATION EXPECTATIONS REMAIN ANCHORED' },
    { time: '09:30:42', text: 'US INITIAL JOBLESS CLAIMS 215K VS 220K EXPECTED' },
    { time: '09:28:11', text: 'GERMAN IFO BUSINESS CLIMATE 87.3 VS 86.5 EXPECTED' },
  ];
</script>

<div class="module news">
  <div class="module-header">News</div>
  <div class="module-content">
    {#each newsItems as item}
      <div class="news-item">
        <span class="news-time">{item.time}</span>
        <span class="news-text">{item.text}</span>
      </div>
    {/each}
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
    padding: 8px;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .news-item {
    display: flex;
    gap: 8px;
    padding: 4px 6px;
    font-size: 11px;
    border-bottom: 1px solid #2a2a4a;
  }

  .news-item:last-child {
    border-bottom: none;
  }

  .news-time {
    color: #666;
    font-family: 'Consolas', monospace;
    flex-shrink: 0;
  }

  .news-text {
    color: #f0a500;
    font-weight: 500;
  }
</style>
