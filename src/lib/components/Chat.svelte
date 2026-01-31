<script lang="ts">
  import { afterUpdate } from 'svelte';
  import { chatMessages, activeVoiceRfqs } from '../stores/game';
  import { handlePlayerChatInput } from '../simulation/gameLoop';

  let inputValue = '';
  let messagesContainer: HTMLDivElement;
  let errorMessage = '';

  // Auto-scroll to bottom when new messages arrive
  afterUpdate(() => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && inputValue.trim()) {
      errorMessage = '';
      const result = handlePlayerChatInput(inputValue.trim());

      if (!result.success) {
        errorMessage = result.message || 'Error processing input';
      }

      inputValue = '';
    }
  }

  // Check if there's an active RFQ
  $: hasActiveRfq = $activeVoiceRfqs.some(r => r.status === 'pending' || r.status === 'quoted');
</script>

<div class="module chat">
  <div class="module-header">
    <span>Chat</span>
    {#if hasActiveRfq}
      <span class="rfq-indicator">RFQ ACTIVE</span>
    {/if}
  </div>
  <div class="module-content">
    <div class="messages" bind:this={messagesContainer}>
      {#if $chatMessages.length === 0}
        <div class="empty-state">Waiting for client inquiries...</div>
      {:else}
        {#each $chatMessages as msg}
          <div class="message {msg.sender}">
            <span class="time">{formatTime(msg.timestamp)}</span>
            <span class="text">{msg.text}</span>
          </div>
        {/each}
      {/if}
    </div>
    <div class="input-area">
      {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
      {/if}
      <input
        type="text"
        placeholder={hasActiveRfq ? "Enter price (e.g. 1.0850 or 50) or 'care' to call off..." : "Waiting for RFQ..."}
        bind:value={inputValue}
        on:keydown={handleKeydown}
        disabled={!hasActiveRfq}
      />
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rfq-indicator {
    background: #4a6a2a;
    color: #4ade80;
    padding: 2px 6px;
    border-radius: 2px;
    font-size: 9px;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .module-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .messages {
    flex: 1;
    padding: 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .empty-state {
    color: #666;
    font-style: italic;
    font-size: 11px;
    padding: 12px;
    text-align: center;
  }

  .message {
    font-size: 11px;
    padding: 4px 0;
    display: flex;
    gap: 8px;
  }

  .message .time {
    color: #555;
    font-family: 'Consolas', monospace;
    font-size: 9px;
    flex-shrink: 0;
  }

  .message.sales .text {
    color: #60a5fa;
  }

  .message.player .text {
    color: #4ade80;
    font-family: 'Consolas', monospace;
  }

  .text {
    color: #ddd;
    word-break: break-word;
  }

  .input-area {
    padding: 8px;
    border-top: 1px solid #3a3a5a;
  }

  .error-message {
    color: #f87171;
    font-size: 10px;
    margin-bottom: 4px;
  }

  input {
    width: 100%;
    background: #2a2a4a;
    border: 1px solid #3a3a5a;
    color: #fff;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  input:focus {
    outline: none;
    border-color: #4a4a7a;
  }

  input:disabled {
    background: #1a1a2a;
    color: #666;
    cursor: not-allowed;
  }

  input::placeholder {
    color: #666;
  }
</style>
