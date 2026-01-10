<script lang="ts">
  let { 
    currentHeroName,
    onFileSelect,
    onScanScreen,
    onExportQR
  }: {
    currentHeroName: string,
    onFileSelect: (e: Event) => void,
    onScanScreen: () => void,
    onExportQR: () => void
  } = $props();
</script>

<header class="top-bar">
  <div class="hero-identity">
    <div class="label">Current Hero</div>
    <h1>{currentHeroName}</h1>
  </div>
  
  <div class="file-controls">
     <label class="btn-primary">
        Import QR Image
        <input type="file" accept="image/*" hidden onchange={onFileSelect} />
     </label>
     <button class="btn-secondary" onclick={onScanScreen}>Scan Screen</button>
     <button class="btn-secondary" onclick={onExportQR}>Export QR</button>
  </div>
</header>

<style>
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #333;
  }

  .hero-identity h1 {
    margin: 0;
    font-size: 2rem;
    background: linear-gradient(90deg, #fff, #aaa);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-identity .label {
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #888;
    letter-spacing: 1px;
  }

  .file-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn-primary, .btn-secondary {
    padding: 0.6rem 1.2rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    display: inline-block;
    border: none;
    font-size: 0.9rem;
  }

  .btn-primary {
    background: #0e639c;
    color: white;
  }

  .btn-secondary {
     background: #444;
     color: #eee;
  }
</style>
