<script lang="ts">
  import { onMount } from 'svelte';
  import { marketPrice, priceHistory } from '../stores/game';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  const MAX_POINTS = 1800; // 180 seconds at 100ms ticks

  // Subscribe to market price updates
  $: {
    if ($marketPrice) {
      priceHistory.update(history => [
        ...history.slice(-(MAX_POINTS - 1)),
        { time: $marketPrice.timestamp, mid: $marketPrice.mid }
      ]);
    }
  }

  // Redraw when history changes
  $: if ($priceHistory) {
    draw();
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  });

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      draw();
    }
  }

  function draw() {
    if (!ctx || !canvas || $priceHistory.length < 2) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 60, bottom: 20, left: 10 };

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Calculate price range (auto-scaling with padding)
    // Minimum range of 20 pips (0.0020) to prevent jarring movements
    const prices = $priceHistory.map(p => p.mid);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const actualRange = maxPrice - minPrice;
    const minRange = 0.0020; // 20 pips minimum
    const priceRange = Math.max(actualRange, minRange);
    const midPrice = (minPrice + maxPrice) / 2;
    const paddedMin = midPrice - priceRange * 0.6;
    const paddedMax = midPrice + priceRange * 0.6;
    const paddedRange = paddedMax - paddedMin;

    // Draw grid lines
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (height - padding.top - padding.bottom) * (i / gridLines);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Price labels
      const price = paddedMax - (paddedRange * i / gridLines);
      ctx.fillStyle = '#666';
      ctx.font = '10px Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(4), width - padding.right + 5, y + 3);
    }

    // Draw price line
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    $priceHistory.forEach((point, i) => {
      const x = padding.left + (i / (MAX_POINTS - 1)) * chartWidth;
      const y = padding.top + (1 - (point.mid - paddedMin) / paddedRange) * chartHeight;

      if (i === 0) {
        ctx!.moveTo(x, y);
      } else {
        ctx!.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw current price marker and label
    if ($priceHistory.length > 0) {
      const lastPoint = $priceHistory[$priceHistory.length - 1];
      const lastX = padding.left + (($priceHistory.length - 1) / (MAX_POINTS - 1)) * chartWidth;
      const lastY = padding.top + (1 - (lastPoint.mid - paddedMin) / paddedRange) * chartHeight;

      // Draw dot on the line
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw current price label on y-axis
      const labelWidth = 52;
      const labelHeight = 16;
      const labelX = width - padding.right + 2;
      const labelY = lastY - labelHeight / 2;

      // Label background
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

      // Label text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(lastPoint.mid.toFixed(4), labelX + 3, lastY + 4);
    }
  }
</script>

<div class="module chart">
  <div class="module-header">EUR/USD</div>
  <div class="module-content">
    <canvas bind:this={canvas}></canvas>
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
    position: relative;
    min-height: 0;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
