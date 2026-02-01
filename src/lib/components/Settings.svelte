<script lang="ts">
  import { settings } from '../stores/settings';
  import { restartGame } from '../simulation/gameLoop';

  export let isOpen = false;

  function close() {
    isOpen = false;
  }

  function handleReset() {
    settings.reset();
  }

  function handleApplyAndRestart() {
    restartGame();
    close();
  }
</script>

{#if isOpen}
  <div class="settings-overlay" on:click={close} on:keydown={(e) => e.key === 'Escape' && close()} role="button" tabindex="0">
    <div class="settings-panel" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="settings-header">
        <h2>Simulation Settings</h2>
        <button class="close-btn" on:click={close}>&times;</button>
      </div>

      <div class="settings-content">
        <div class="settings-grid">
          <!-- Left Column -->
          <div class="column">
            <!-- News & Events Section -->
            <section class="settings-section">
              <h3>News & Events</h3>
              <label class="row">
                <span>Random News</span>
                <input type="checkbox" bind:checked={$settings.news.newsEnabled} />
              </label>
              <label class="row">
                <span>Data Releases</span>
                <input type="checkbox" bind:checked={$settings.news.releasesEnabled} />
              </label>
              <label class="row">
                <span>News Chance (%/min)</span>
                <input type="number" bind:value={$settings.news.newsChancePerMinute} min="0" max="1" step="0.01" />
              </label>
              <label class="row">
                <span>Min News Gap (min)</span>
                <input type="number" bind:value={$settings.news.minNewsBetweenMinutes} min="1" max="300" step="1" />
              </label>
              <label class="row">
                <span>Release Delay Min</span>
                <input type="number" bind:value={$settings.news.releaseDelayMin} min="10" max="300" step="5" />
              </label>
              <label class="row">
                <span>Release Delay Max</span>
                <input type="number" bind:value={$settings.news.releaseDelayMax} min="10" max="300" step="5" />
              </label>
            </section>

            <!-- Market Simulation Section -->
            <section class="settings-section">
              <h3>Market Simulation</h3>
              <label class="row">
                <span>Initial Mid Price</span>
                <input type="number" bind:value={$settings.market.initialMid} min="0.5" max="2" step="0.0001" />
              </label>
              <label class="row">
                <span>Volatility (pips/tick)</span>
                <input type="number" value={$settings.market.volatility * 10000}
                  on:input={(e) => settings.updateMarket({ volatility: parseFloat(e.currentTarget.value) / 10000 })}
                  min="0" max="10" step="0.1" />
              </label>
              <label class="row">
                <span>Drift (pips/tick)</span>
                <input type="number" value={$settings.market.drift * 10000}
                  on:input={(e) => settings.updateMarket({ drift: parseFloat(e.currentTarget.value) / 10000 })}
                  min="-1" max="1" step="0.01" />
              </label>
              <label class="row">
                <span>Base Spread (pips)</span>
                <input type="number" value={$settings.market.baseSpread * 10000}
                  on:input={(e) => settings.updateMarket({ baseSpread: parseFloat(e.currentTarget.value) / 10000 })}
                  min="0" max="10" step="0.1" />
              </label>
            </section>
          </div>

          <!-- Right Column -->
          <div class="column">
            <!-- Market Impact Section -->
            <section class="settings-section">
              <h3>Market Impact</h3>
              <label class="row">
                <span>Enable Impact</span>
                <input type="checkbox" bind:checked={$settings.impact.enabled} />
              </label>
              <label class="row">
                <span>Half Life (ms)</span>
                <input type="number" bind:value={$settings.impact.halfLifeMs} min="100" max="60000" step="100" />
              </label>
              <label class="row">
                <span>Max Impact (pips)</span>
                <input type="number" bind:value={$settings.impact.maxImpactPips} min="0.5" max="20" step="0.5" />
              </label>
              <label class="row">
                <span>Size Scale Factor</span>
                <input type="number" bind:value={$settings.impact.sizeScaleFactor} min="0.000001" max="0.0001" step="0.000001" />
              </label>
              <label class="row">
                <span>Burst Window (ms)</span>
                <input type="number" bind:value={$settings.impact.burstWindowMs} min="1000" max="30000" step="500" />
              </label>
              <label class="row">
                <span>Burst Multiplier Max</span>
                <input type="number" bind:value={$settings.impact.burstMultiplierMax} min="1" max="10" step="0.5" />
              </label>
            </section>
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <button class="btn btn-secondary" on:click={handleReset}>Reset to Defaults</button>
        <button class="btn btn-primary" on:click={handleApplyAndRestart}>Apply & Restart</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .settings-panel {
    background: #1a1a2e;
    border: 1px solid #3a3a5a;
    border-radius: 8px;
    width: 700px;
    display: flex;
    flex-direction: column;
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #3a3a5a;
  }

  .settings-header h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: #fff;
  }

  .settings-content {
    padding: 12px 16px;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .settings-section {
    background: #0f0f1a;
    border-radius: 4px;
    padding: 10px 12px;
  }

  .settings-section h3 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #60a5fa;
    margin: 0 0 8px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #2a2a4a;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }

  .row span {
    font-size: 11px;
    color: #aaa;
  }

  .row input[type="checkbox"] {
    width: 14px;
    height: 14px;
    cursor: pointer;
  }

  .row input[type="number"] {
    width: 90px;
    padding: 3px 6px;
    background: #1a1a2e;
    border: 1px solid #3a3a5a;
    border-radius: 3px;
    color: #fff;
    font-family: 'Consolas', monospace;
    font-size: 11px;
    text-align: right;
  }

  .row input[type="number"]:focus {
    outline: none;
    border-color: #60a5fa;
  }

  .settings-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px 16px;
    border-top: 1px solid #3a3a5a;
  }

  .btn {
    padding: 6px 14px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }

  .btn-secondary {
    background: #2a2a4a;
    color: #ccc;
  }

  .btn-secondary:hover {
    background: #3a3a5a;
  }

  .btn-primary {
    background: #3b82f6;
    color: #fff;
  }

  .btn-primary:hover {
    background: #2563eb;
  }
</style>
