<script lang="ts">
  import { randomizeParsedData, nullifyParsedData } from '$lib/utils/preset-manager';
  import type { ParsedNarakaData } from '$lib/utils/naraka/char-editor';

  let { editorContent = $bindable() }: { editorContent: { json: ParsedNarakaData | null } } = $props();

  function randomize() {
    if (!editorContent.json) return;
    if (!confirm('Are you sure you want to randomize face values? (0-100)')) return;
    editorContent.json = randomizeParsedData(editorContent.json);
  }

  function nullify() {
    if (!editorContent.json) return;
    if (!confirm('Are you sure you want to set all face values to 0?')) return;
    editorContent.json = nullifyParsedData(editorContent.json);
  }
</script>

<div class="editor-controls">
  <button onclick={randomize} class="btn-action">Randomize (0-100)</button>
  <button onclick={nullify} class="btn-action">Nullify (0)</button>
</div>

<style>
  .editor-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .btn-action {
    background: #444;
    color: #ddd;
    border: none; 
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-action:hover {
    background: #555;
  }
</style>
