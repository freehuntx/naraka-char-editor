<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { 
    decodeCodeToParsed, 
    encodeParsedToRaw, 
    encodeRawToQRCode,
    type ParsedNarakaData 
  } from '$lib/utils/naraka/char-editor';
  import { readQRCode, fetchNarakaData } from '$lib/utils/qr-reader';
  import { heroes } from '$lib/utils/naraka/heroes';
  import { type Preset } from '$lib/utils/preset-manager';
  
  import PresetSidebar from '$lib/components/PresetSidebar.svelte';
  import EditorHeader from '$lib/components/EditorHeader.svelte';
  import EditorControls from '$lib/components/EditorControls.svelte';
  import JsonEditorWrapper from '$lib/components/JsonEditorWrapper.svelte';
  import Toast from '$lib/components/Toast.svelte';

  // --- State ---
  let editorContent = $state<{ json: ParsedNarakaData | null }>({
    json: browser && localStorage.getItem('editorContent')
      ? JSON.parse(localStorage.getItem('editorContent')!)
      : null
  });

  let presets = $state<Preset[]>([]);
  let processing = $state(false);
  let dragHover = $state(false);

  // --- Toast ---
  let toast = $state<{ message: string, visible: boolean, type: 'success' | 'error' }>({ 
    message: '', visible: false, type: 'success' 
  });
  let toastTimeout: ReturnType<typeof setTimeout>;

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast = { message, visible: true, type };
    toastTimeout = setTimeout(() => {
      toast.visible = false;
    }, 3000);
  }

  // --- Derived ---
  let currentHeroIdString = $derived(editorContent.json?.faceData?.HeroID);
  let currentHeroName = $derived(
    !editorContent.json
      ? 'No Data'
      : (heroes.find(h => h.id === currentHeroIdString)?.name ?? `Unknown Hero (${currentHeroIdString ?? '?'})`)
  );

  // --- Lifecycle ---
  onMount(() => {
    loadPresets();
  });

  // --- Persistence ---
  $effect(() => {
    if (browser) {
      localStorage.setItem('editorContent', JSON.stringify(editorContent.json));
    }
  });

  function loadPresets() {
    if (!browser) return;
    try {
      const stored = localStorage.getItem('naraka_presets');
      if (stored) {
        presets = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load presets", e);
    }
  }

  function savePresets() {
    if (browser) {
      localStorage.setItem('naraka_presets', JSON.stringify(presets));
    }
  }

  // --- QR & File Handling ---
  async function processQRData(qrData: string) {
    processing = true;
    try {
      const actualData = await fetchNarakaData(qrData);
      const decoded = decodeCodeToParsed(actualData);
      if (!decoded) {
        throw new Error('Failed to decode Naraka data');
      }
      editorContent = { json: decoded };
      showToast('QR Code imported successfully!');
    } catch (e: any) {
      showToast('Error processing data: ' + e.message, 'error');
    } finally {
      processing = false;
    }
  }

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) await processFile(file);
    target.value = ''; 
  }

  async function processFile(file: File) {
    processing = true;
    try {
      const qrData = await readQRCode(file);
      if (!qrData) {
        showToast('No QR code found in image', 'error');
        return;
      }
      await processQRData(qrData);
    } catch (e: any) {
      showToast('Failed to read QR code: ' + e.message, 'error');
    } finally {
      processing = false;
    }
  }

  async function takeScreenshot() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob(async (blob) => {
        if (blob) {
          await processFile(new File([blob], "screenshot.png", { type: "image/png" }));
        }
      });
    } catch (e: any) {
      console.error(e);
      if (e.name !== 'NotAllowedError') {
        showToast('Failed to take screenshot: ' + e.message, 'error');
      }
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragHover = false;
    const file = e.dataTransfer?.files[0];
    if (file) processFile(file);
  }

  async function handlePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) await processFile(file);
        break;
      }
    }
  }

  async function downloadQR() {
    if (!editorContent.json) return;
    try {
        processing = true;
        const raw = encodeParsedToRaw(editorContent.json);
        const dataUrl = await encodeRawToQRCode(raw);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `naraka-${currentHeroName.replace(/\s+/g,'-')}-${Date.now()}.png`;
        link.click();
        showToast('QR Code exported successfully!');
    } catch(e: any) {
        showToast("Failed to generate QR: " + e.message, 'error');
    } finally {
        processing = false;
    }
  }

</script>

<svelte:window onpaste={handlePaste} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div 
  class="page-container" 
  ondrop={handleDrop} 
  ondragover={(e) => { e.preventDefault(); dragHover = true; }}
  ondragleave={() => dragHover = false}
  role="application"
>
  <PresetSidebar 
    bind:presets 
    bind:editorContent 
    onSavePresets={savePresets}
    {showToast}
  />

  <main class="editor-area {dragHover ? 'drag-active' : ''}">
    
    <EditorHeader 
        {currentHeroName}
        onFileSelect={handleFileUpload}
        onScanScreen={takeScreenshot}
        onExportQR={downloadQR}
    />
    
    {#if processing}
      <div class="loading-overlay">Processing...</div>
    {/if}

    {#if editorContent.json}
      <EditorControls bind:editorContent />
      
      <JsonEditorWrapper bind:editorContent />
    {:else}
      <div class="empty-state">
        <div class="empty-content">
          <h2>No Character Data Loaded</h2>
          <p>Please import a QR code image containing Naraka Bladepoint character data to begin.</p>
          <div class="instructions">
            <p>• Drag and drop a QR code image anywhere on this page</p>
            <p>• Click "Import QR Image"</p>
            <p>• Click "Scan Screen"</p>
            <p>• Paste an image from your clipboard (Ctrl+V)</p>
          </div>
        </div>
      </div>
    {/if}

    <Toast {...toast} />

  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #1e1e1e;
    color: #eee;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color-scheme: dark;
  }

  .page-container {
    display: grid;
    grid-template-columns: 350px 1fr;
    height: 100vh;
    overflow: hidden;
  }

  /* Main Editor */
  .editor-area {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    position: relative;
    overflow: hidden;
  }

  .editor-area.drag-active {
    background: #2a2d2e;
    outline: 2px dashed #0e639c;
    outline-offset: -10px;
  }

  .loading-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    font-size: 1.5rem;
  }

  /* Empty State */
  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #444;
    border-radius: 8px;
    margin-top: 1rem;
    background: #252526;
  }

  .empty-content {
    text-align: center;
    color: #888;
    max-width: 400px;
  }

  .empty-content h2 {
    color: #ccc;
    font-weight: 300;
    margin-bottom: 1rem;
  }

  .instructions {
    text-align: left;
    margin-top: 1.5rem;
    background: #1e1e1e;
    padding: 1rem;
    border-radius: 6px;
  }

  .instructions p {
    margin: 0.5rem 0;
  }
</style>
