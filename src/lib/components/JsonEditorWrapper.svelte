<script lang="ts">
  import { JSONEditor } from 'svelte-jsoneditor';
  // @ts-ignore
  import 'svelte-jsoneditor/themes/jse-theme-dark.css';
  import type { ParsedNarakaData } from '$lib/utils/naraka/char-editor';

  let { editorContent = $bindable() }: { editorContent: { json: ParsedNarakaData | null } } = $props();
</script>

<div class="json-editor-container jse-theme-dark">
  {#if editorContent.json}
    <JSONEditor bind:content={editorContent} />
  {/if}
</div>

<style>
  .json-editor-container {
    flex: 1;
    border: 1px solid #333;
    border-radius: 4px;
    overflow: hidden;
  }
</style>
