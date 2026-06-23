<script setup lang="ts">
import { Shuffle, FolderOpen } from "@lucide/vue";
import { useVideoStore } from "../stores/videoStore";

const store = useVideoStore();
const firstPath = () => store.videoPaths[store.batch[0]] ?? null;
</script>

<template>
  <div class="flex gap-2">
    <button
      @click="store.refreshBatch()"
      :disabled="!store.total"
      class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors font-semibold"
    >
      <Shuffle :size="15" /> Refresh All
    </button>
    <button
      @click="store.openFolder(firstPath()!)"
      :disabled="!firstPath()"
      class="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
    >
      <FolderOpen :size="15" /> Folder
    </button>
  </div>
</template>
