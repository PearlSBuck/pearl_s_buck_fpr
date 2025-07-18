<script lang="ts">
  import { onMount } from 'svelte';
  import _SignaturePad from 'signature_pad';

  
  let canvas: HTMLCanvasElement;
  let pad: _SignaturePad;

  export let penColor = 'black';
  export let backgroundColor = 'rgba(0,0,0,0)';
  export let minWidth = 0.5;
  export let maxWidth = 1;

  onMount(() => {
    pad = new _SignaturePad(canvas, { penColor, backgroundColor, minWidth, maxWidth });
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  });

  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
    pad.clear();
  }

  export function toDataURL(type = 'image/png', quality?: number) {
    return pad.toDataURL(type, quality);
  }
  export function clear() { pad.clear(); }
  export function isEmpty() { return pad.isEmpty(); }
</script>

<div class="sig-container">
  <canvas bind:this={canvas} class='border-2 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none p-2 w-full h-50' ></canvas>
</div>
