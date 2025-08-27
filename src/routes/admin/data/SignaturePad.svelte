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
    
    // Add signature method toggle
    let signatureMethod: 'draw' | 'upload' = 'draw';
    let uploadedSignature: string | null = null;
    
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

    function handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        
        if (!file) return;
        
        // File type validation
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            alert('Please upload a PNG or JPG image');
            return;
        }
        
        // File size validation (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Please upload an image smaller than 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedSignature = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    function confirm() {
        if (signatureMethod === 'draw') {
            if (isEmpty()) {
                alert('Please sign the document before proceeding.');
                return;
            }
            const signatureData = canvasElement.toDataURL('image/png');
            dispatch('confirm', { signatureData, name });
        } else {
            if (!uploadedSignature) {
                alert('Please upload a signature image.');
                return;
            }
            dispatch('confirm', { signatureData: uploadedSignature, name });
        }
    }
    
    function cancel() {
        dispatch('cancel');
    }
    
    function switchMethod(method: 'draw' | 'upload') {
        signatureMethod = method;
        if (method === 'draw' && canvasElement) {
            uploadedSignature = null;
            // Allow time for canvas to be available in the DOM
            setTimeout(setupCanvas, 0);
        }
    }
    
    function removeUploadedImage() {
        uploadedSignature = null;
    }
</script>

<div class="signature-modal">
    <div class="signature-container">
        <h2>{title}</h2>
        
        <div class="name-input">
            <label for="signer-name">Your Name:</label>
            <input type="text" id="signer-name" bind:value={name} placeholder="Enter your name" />
        </div>
        
        <div class="signature-method-toggle">
            <button 
                type="button"
                class:active={signatureMethod === 'draw'} 
                on:click={() => switchMethod('draw')}>
                Draw Signature
            </button>
            <button 
                type="button"
                class:active={signatureMethod === 'upload'} 
                on:click={() => switchMethod('upload')}>
                Upload Signature
            </button>
        </div>
        
        {#if signatureMethod === 'draw'}
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
        {:else}
            <div class="signature-upload-container">
                {#if uploadedSignature}
                    <div class="preview-container">
                        <p>Signature preview:</p>
                        <img src={uploadedSignature} alt="Uploaded signature" class="signature-preview" />
                        <button type="button" on:click={removeUploadedImage} class="clear-btn">Remove</button>
                    </div>
                {:else}
                    <div class="upload-area">
                        <p>Upload your signature image (PNG or JPG):</p>
                        <label for="signature-upload" class="upload-label">
                            <span>Select an image file</span>
                            <small>(Transparent background recommended)</small>
                        </label>
                        <input 
                            type="file" 
                            id="signature-upload" 
                            accept="image/png,image/jpeg,image/jpg" 
                            on:change={handleImageUpload} 
                            class="file-input"
                        />
                    </div>
                {/if}
            </div>
        {/if}
        
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
    
    .signature-method-toggle {
        display: flex;
        margin-bottom: 15px;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid #ccc;
    }
    
    .signature-method-toggle button {
        flex: 1;
        padding: 8px 0;
        background-color: #f0f0f0;
        border: none;
        cursor: pointer;
    }
    
    .signature-method-toggle button.active {
        background-color: #1A5A9E;
        color: white;
        font-weight: bold;
    }
    
    .signature-pad-container, 
    .signature-upload-container {
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
    
    .upload-area {
        width: 100%;
        text-align: center;
    }
    
    .upload-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px dashed #ccc;
        border-radius: 4px;
        padding: 30px 15px;
        cursor: pointer;
        margin: 10px 0;
        transition: background-color 0.2s;
    }
    
    .upload-label:hover {
        background-color: #f9f9f9;
    }
    
    .upload-label small {
        color: #777;
        margin-top: 5px;
    }
    
    .file-input {
        display: none;
    }
    
    .preview-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .signature-preview {
        max-width: 100%;
        max-height: 200px;
        border: 1px solid #ccc;
        padding: 10px;
        margin: 10px 0;
        background-color: white;
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
    
    p {
        margin: 5px 0;
        width: 100%;
    }
</style>