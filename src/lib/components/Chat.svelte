<script lang="ts">
  // Chat module - voice pricing via sales
  let inputValue = '';

  const messages = [
    { from: 'sales', name: 'John', text: 'I need a bid in 10 for MacroHard Software' },
    { from: 'trader', name: 'You', text: '1.0850' },
    { from: 'sales', name: 'John', text: 'Done, you sell 10 at 1.0850' },
  ];

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && inputValue.trim()) {
      // Will handle message sending later
      inputValue = '';
    }
  }
</script>

<div class="module chat">
  <div class="module-header">Chat</div>
  <div class="module-content">
    <div class="messages">
      {#each messages as msg}
        <div class="message {msg.from}">
          <span class="sender">{msg.name}:</span>
          <span class="text">{msg.text}</span>
        </div>
      {/each}
    </div>
    <div class="input-area">
      <input
        type="text"
        placeholder="Type price or message..."
        bind:value={inputValue}
        on:keydown={handleKeydown}
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
  }

  .module-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .messages {
    flex: 1;
    padding: 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .message {
    font-size: 12px;
    padding: 4px 0;
  }

  .message.sales .sender {
    color: #60a5fa;
  }

  .message.trader .sender {
    color: #4ade80;
  }

  .sender {
    font-weight: 600;
    margin-right: 6px;
  }

  .text {
    color: #ddd;
  }

  .input-area {
    padding: 8px;
    border-top: 1px solid #3a3a5a;
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

  input::placeholder {
    color: #666;
  }
</style>
