<script lang="ts">
  // Trade Blotter - active requests and executed trades
  const trades = [
    { id: 1, status: 'pending', client: 'MacroHard Corp', side: 'BUY', size: '10M', price: '1.0855', type: 'electronic' },
    { id: 2, status: 'done', client: "Bill's Bakery", side: 'SELL', size: '5M', price: '1.0848', type: 'voice' },
    { id: 3, status: 'done', client: 'ABC Capital', side: 'BUY', size: '25M', price: '1.0852', type: 'electronic' },
  ];
</script>

<div class="module blotter">
  <div class="module-header">Trade Blotter</div>
  <div class="module-content">
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Client</th>
          <th>Side</th>
          <th>Size</th>
          <th>Price</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {#each trades as trade}
          <tr class={trade.status}>
            <td>
              {#if trade.status === 'pending'}
                <button class="reject-btn">✕</button>
              {:else}
                <span class="done-icon">✓</span>
              {/if}
            </td>
            <td>{trade.client}</td>
            <td class={trade.side.toLowerCase()}>{trade.side}</td>
            <td>{trade.size}</td>
            <td class="price">{trade.price}</td>
            <td class="type">{trade.type}</td>
          </tr>
        {/each}
      </tbody>
    </table>
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

  tr.pending {
    background: #2a2a3a;
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
  }

  .reject-btn:hover {
    background: #5a3d4e;
  }

  .done-icon {
    color: #4ade80;
  }

  .buy {
    color: #4ade80;
  }

  .sell {
    color: #f87171;
  }

  .price {
    font-family: 'Consolas', monospace;
  }

  .type {
    color: #666;
    font-style: italic;
  }
</style>
