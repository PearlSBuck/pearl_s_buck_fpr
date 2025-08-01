<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    
    // Define the event types for the dispatcher
    interface SignatureEvents {
        confirm: { signatureData: string; name: string };
        cancel: void;
    }
    
    export let name = '';
    export let title = 'Sign Document';
    
    let canvasElement: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Properly typed event dispatcher
    const dispatch = createEventDispatcher<SignatureEvents>();
    
    onMount(() => {
        if (canvasElement) {
        ctx = canvasElement.getContext('2d')!;
        setupCanvas();
        }
    });
    
    function setupCanvas() {
        // Set canvas width and height to match its display size
        const rect = canvasElement.getBoundingClientRect();
        canvasElement.width = rect.width;
        canvasElement.height = rect.height;
        
        // Configure the canvas context
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        clearCanvas();
    }

    function startDrawing(event: MouseEvent | TouchEvent) {
        drawing = true;
        const pos = getPosition(event);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(event: MouseEvent | TouchEvent) {
        if (!drawing) return;
        
        // Prevent scrolling on touch devices
        event.preventDefault();
        
        const pos = getPosition(event);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        lastX = pos.x;
        lastY = pos.y;
    }

    function stopDrawing() {
        drawing = false;
    }

    function getPosition(event: MouseEvent | TouchEvent) {
        let x, y;
        const rect = canvasElement.getBoundingClientRect();
        
        if ('touches' in event) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
        } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        }
        
        return { x, y };
    }

    function clearCanvas() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    }

    function isEmpty() {
        const blank = document.createElement('canvas');
        blank.width = canvasElement.width;
        blank.height = canvasElement.height;
        
        const blankCtx = blank.getContext('2d')!;
        blankCtx.fillStyle = '#ffffff';
        blankCtx.fillRect(0, 0, blank.width, blank.height);
        
        return canvasElement.toDataURL() === blank.toDataURL();
    }

    function confirm() {
        if (isEmpty()) {
            alert('Please sign the document before proceeding.');
            return;
        }
        
        const signatureData = canvasElement.toDataURL('image/png');
        dispatch('confirm', { signatureData, name });
    }
    
    function cancel() {
        dispatch('cancel');
    }
</script>

<div class="signature-modal">
    <div class="signature-container">
        <h2>{title}</h2>
        
        <div class="name-input">
        <label for="signer-name">Your Name:</label>
        <input type="text" id="signer-name" bind:value={name} placeholder="Enter your name" />
        </div>
        
        <div class="signature-pad-container">
        <p>Sign below:</p>
        <canvas 
            bind:this={canvasElement}
            class="signature-pad"
            on:mousedown={startDrawing}
            on:mousemove={draw}
            on:mouseup={stopDrawing}
            on:mouseleave={stopDrawing}
            on:touchstart={startDrawing}
            on:touchmove={draw}
            on:touchend={stopDrawing}
            on:touchcancel={stopDrawing}
        ></canvas>
        
        <button type="button" on:click={clearCanvas} class="clear-btn">Clear</button>
        </div>
        
        <div class="button-row">
        <button type="button" on:click={cancel} class="cancel-btn">Cancel</button>
        <button type="button" on:click={confirm} class="confirm-btn">OK</button>
        </div>
    </div>
</div>

<style>
    .signature-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .signature-container {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    h2 {
        margin-top: 0;
        color: #1A5A9E;
        text-align: center;
    }
    
    .name-input {
        margin-bottom: 15px;
    }
    
    input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    
    .signature-pad-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .signature-pad {
        border: 1px solid #ccc;
        width: 100%;
        height: 200px;
        background-color: white;
        touch-action: none;
    }
    
    .clear-btn {
        margin-top: 5px;
        align-self: flex-end;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        padding: 5px 10px;
        border-radius: 4px;
    }
    
    .button-row {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    
    .cancel-btn, .confirm-btn {
        padding: 8px 15px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
    }
    
    .cancel-btn {
        background-color: #f0f0f0;
        color: #333;
    }
    
    .confirm-btn {
        background-color: #1A5A9E;
        color: white;
    }
</style>