<script lang="ts">
  import { electronicRfqs, eTierPrices } from '../stores/game';
  import { rejectElectronicRfq } from '../simulation/gameLoop';
  import { formatPrice } from '../utils/format';

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function getTimeRemaining(expiryTime: number): string {
    const remaining = Math.max(0, expiryTime - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    return `${seconds}s`;
  }

  function handleReject(rfqId: string) {
    rejectElectronicRfq(rfqId);
  }

  // Get the tier key for a given size
  function getTierForSize(size: number): '1' | '5' | '10' | '50' {
    if (size >= 50) return '50';
    if (size >= 10) return '10';
    if (size >= 5) return '5';
    return '1';
  }

  // Get the price for a given side and size
  function getPrice(side: 'buy' | 'sell', size: number): number {
    const tier = getTierForSize(size);
    const tierPrices = $eTierPrices[tier];
    // If client is buying, we show our offer (ask)
    // If client is selling, we show our bid
    return side === 'buy' ? tierPrices.ask : tierPrices.bid;
  }
</script>

<div class="module rfq-blotter">
  <div class="module-header">Electronic RFQs</div>
  <div class="module-content">
    {#if $electronicRfqs.length === 0}
      <div class="empty-state">No active RFQs</div>
    {:else}
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Client</th>
            <th>Side</th>
            <th>Size</th>
            <th>Banks</th>
            <th>Price</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {#each $electronicRfqs as rfq (rfq.id)}
            <tr class={rfq.status}>
              <td class="action-cell">
                {#if rfq.status === 'quoting'}
                  <button class="reject-btn" on:click={() => handleReject(rfq.id)} title="Pass on this RFQ">
                    ✕
                  </button>
                {:else if rfq.status === 'traded'}
                  <span class="traded-icon">✓</span>
                {:else}
                  <span class="passed-icon">-</span>
                {/if}
              </td>
              <td class="client">{rfq.client.name}</td>
              <td class="side {rfq.side}">{rfq.side === 'buy' ? 'OFFER' : 'BID'}</td>
              <td class="size">{rfq.size}M</td>
              <td class="banks">{rfq.banksAsked}</td>
              <td class="price">
                {#if rfq.status === 'traded' && rfq.tradedPrice}
                  {formatPrice(rfq.tradedPrice)}
                {:else if rfq.status === 'quoting'}
                  {formatPrice(getPrice(rfq.side, rfq.size))}
                {:else}
                  -
                {/if}
              </td>
              <td class="time">
                {#if rfq.status === 'quoting'}
                  {getTimeRemaining(rfq.expiryTime)}
                {:else if rfq.status === 'traded'}
                  DONE
                {:else if rfq.status === 'passed'}
                  PASS
                {:else}
                  EXP
                {/if}
              </td>
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

  .empty-state {
    padding: 20px;
    text-align: center;
    color: #666;
    font-style: italic;
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
    position: sticky;
    top: 0;
  }

  td {
    padding: 6px 8px;
    border-bottom: 1px solid #2a2a4a;
  }

  tr.quoting {
    background: #1a1a2e;
  }

  tr.traded {
    background: #1a3a2a;
  }

  tr.passed, tr.expired {
    background: #3a1a2a;
  }

  .action-cell {
    width: 30px;
    text-align: center;
  }

  .reject-btn {
    background: #4a2d3e;
    border: none;
    color: #f87171;
    width: 20px;
    height: 20px;
    border-radius: 2px;
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reject-btn:hover {
    background: #5a3d4e;
  }

  .traded-icon {
    color: #4ade80;
    font-weight: bold;
  }

  .passed-icon {
    color: #f87171;
  }

  .client {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .side {
    font-weight: 600;
  }

  .side.buy {
    color: #4ade80;
  }

  .side.sell {
    color: #f87171;
  }

  .size {
    font-family: 'Consolas', monospace;
  }

  .banks {
    font-family: 'Consolas', monospace;
    color: #888;
    font-size: 10px;
  }

  .price {
    font-family: 'Consolas', monospace;
  }

  tr.quoting .price {
    color: #60a5fa;
  }

  tr.traded .price {
    color: #4ade80;
  }

  .time {
    font-family: 'Consolas', monospace;
    font-size: 10px;
  }

  tr.quoting .time {
    color: #f59e0b;
  }

  tr.traded .time {
    color: #4ade80;
    font-weight: 600;
  }

  tr.passed .time, tr.expired .time {
    color: #f87171;
  }
</style>
