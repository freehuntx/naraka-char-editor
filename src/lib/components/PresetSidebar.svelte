<script lang="ts">
  import { heroes } from '$lib/utils/naraka/heroes';
  import { applySmartPreset, type Preset } from '$lib/utils/preset-manager';
  import type { ParsedNarakaData } from '$lib/utils/naraka/char-editor';

  let { 
    presets = $bindable(), 
    editorContent = $bindable(),
    onSavePresets,
    showToast
  }: {
    presets: Preset[],
    editorContent: { json: ParsedNarakaData | null },
    onSavePresets: () => void,
    showToast: (msg: string, type?: 'success' | 'error') => void
  } = $props();

  let presetNameInput = $state('');

  function saveCurrentAsPreset() {
    if (!editorContent.json) {
      showToast('No character data to save', 'error');
      return;
    }
    if (!presetNameInput.trim()) {
      alert('Please enter a preset name');
      return;
    }
    const newPreset: Preset = {
      id: crypto.randomUUID(),
      name: presetNameInput.trim(),
      data: JSON.parse(JSON.stringify(editorContent.json)),
      createdAt: Date.now()
    };
    presets = [newPreset, ...presets];
    onSavePresets();
    presetNameInput = '';
  }

  function deletePreset(id: string) {
    if (!confirm('Delete this preset?')) return;
    presets = presets.filter(p => p.id !== id);
    onSavePresets();
  }

  function applyPreset(preset: Preset) {
    if (!editorContent.json) {
       showToast('No character data loaded. Loading full preset instead.', 'error');
       // Fallback or just stop? "Smart Apply" usually implies mixing. 
       // If empty, mixing isn't really defined or is same as full apply if we assume defaults.
       // Let's just do full apply or tell user to load something?
       // The user said "if there is currently no character data loaded, just show some informations"
       // But here we are in the sidebar. If they click smart apply, it's weird.
       // Let's just do full apply if nothing is loaded.
       editorContent.json = JSON.parse(JSON.stringify(preset.data));
       return;
    }
    editorContent.json = applySmartPreset(editorContent.json, preset.data);
    showToast('Smart Apply successful!');
  }
  
  function applyFullPreset(preset: Preset) {
    if(confirm('This will load the full character data, replacing the current hero. Continue?')) {
        editorContent.json = JSON.parse(JSON.stringify(preset.data));
        showToast('Character loaded successfully!');
    }
  }
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <h2>Presets</h2>
    <div class="preset-form">
      <input 
        type="text" 
        placeholder="New Preset Name" 
        bind:value={presetNameInput}
        onkeydown={(e) => e.key === 'Enter' && saveCurrentAsPreset()}
      />
      <button class="btn-secondary" onclick={saveCurrentAsPreset} disabled={!presetNameInput}>Save</button>
    </div>
  </div>

  <div class="presets-list">
    {#each presets as preset (preset.id)}
      <div class="preset-card">
        <div class="preset-info">
          <span class="preset-name">{preset.name}</span>
          <span class="preset-hero">
             {heroes.find(h => h.id === preset.data.faceData?.HeroID)?.name ?? 'Unknown'}
          </span>
        </div>
        <div class="preset-actions">
          <button class="btn-apply-smart" onclick={() => applyPreset(preset)} title="Apply only compatible face sliders">Smart Apply</button>
          <button class="btn-load" onclick={() => applyFullPreset(preset)} title="Load full character">Load</button>
          <button class="btn-delete" onclick={() => deletePreset(preset.id)}>×</button>
        </div>
      </div>
    {/each}
    {#if presets.length === 0}
      <p class="empty-state">No presets saved. Scan a QR code to start!</p>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    background: #252526;
    border-right: 1px solid #333;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
  }

  .sidebar-header {
    margin-bottom: 1.5rem;
  }

  .sidebar-header h2 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #ddd;
  }

  .preset-form {
    display: flex;
    gap: 0.5rem;
  }

  .preset-form input {
    flex: 1;
    background: #333;
    border: 1px solid #444;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .preset-card {
    background: #333;
    border-radius: 6px;
    padding: 0.8rem;
    margin-bottom: 0.8rem;
    border: 1px solid #444;
  }

  .preset-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
  }

  .preset-hero {
    color: #888;
    font-size: 0.8rem;
  }

  .preset-actions {
    display: flex;
    gap: 0.5rem;
  }

  .preset-actions button {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    border: none;
    border-radius: 3px;
    color: white;
  }

  .btn-secondary {
     background: #444;
     color: #eee;
     padding: 0.6rem 1.2rem;
     border-radius: 4px;
     font-weight: 500;
  }

  .btn-apply-smart { background: #0e639c; flex: 2; }
  .btn-load { background: #444; flex: 1; }
  .btn-delete { background: #c0392b; width: 24px; }

  .empty-state {
    color: #666;
    text-align: center;
    margin-top: 2rem;
    font-style: italic;
  }
</style>
