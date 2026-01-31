<script lang="ts">
  import { trades } from '../stores/game';
  import { formatPrice } from '../utils/format';

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
</script>

<div class="module blotter">
  <div class="module-header">Trade Blotter</div>
  <div class="module-content">
    {#if $trades.length === 0}
      <div class="empty-state">No trades yet</div>
    {:else}
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Client</th>
            <th>Side</th>
            <th>Size</th>
            <th>Price</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {#each [...$trades].reverse() as trade}
            <tr>
              <td class="time">{formatTime(trade.timestamp)}</td>
              <td>{trade.clientName}</td>
              <td class={trade.side}>{trade.side.toUpperCase()}</td>
              <td>{trade.size}M</td>
              <td class="price">{formatPrice(trade.price)}</td>
              <td class="type">{trade.type}</td>
            </tr>
          {/each}
        </tbody>
      </table>
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
    overflow-y: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }

  th {
    text-align: left;
    padding: 6px 8px;
    background: #2a2a4a;
    font-weight: 500;
    color: #888;
    text-transform: uppercase;
    font-size: 10px;
  }

  td {
    padding: 6px 8px;
    border-bottom: 1px solid #2a2a4a;
  }

  .empty-state {
    padding: 20px;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .time {
    font-family: 'Consolas', monospace;
    color: #888;
    font-size: 10px;
  }

  .buy {
    color: #4ade80;
    font-weight: 600;
  }

  .sell {
    color: #f87171;
    font-weight: 600;
  }

  .price {
    font-family: 'Consolas', monospace;
  }

  .type {
    color: #666;
    font-style: italic;
  }
</style>
