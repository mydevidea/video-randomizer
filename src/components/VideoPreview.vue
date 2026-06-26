<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Video, FolderOpen } from "@lucide/vue";
import { startDrag } from "@crabnebula/tauri-plugin-drag";
import { useVideoStore } from "../stores/videoStore";
import type { VideoFile } from "../types";

const store = useVideoStore();
const metaCache = ref<Record<string, VideoFile>>({});
const dragging = ref(false);

const batchPaths = computed(() =>
  store.batch.map((idx) => store.videoPaths[idx] ?? null).filter(Boolean) as string[]
);

watch(
  batchPaths,
  async (paths) => {
    for (const p of paths) {
      if (!metaCache.value[p]) {
        metaCache.value[p] = await store.getMetadata(p);
      }
    }
  },
  { immediate: true }
);

function fileName(path: string) {
  return path.split(/[\\/]/).pop() ?? path;
}

async function onMouseDown() {
  if (!batchPaths.value.length) return;
  dragging.value = true;
  try {
    await startDrag({
      item: batchPaths.value,
      icon: "icons/icon.png",
    });
  } finally {
    dragging.value = false;
  }
}
</script>

<template>
  <div
    v-if="!store.total"
    class="flex flex-col items-center justify-center py-16 text-gray-600 gap-3"
  >
    <FolderOpen :size="48" class="text-gray-700" />
    <p class="text-sm">Add a folder in Settings to get started</p>
  </div>

  <div
    v-else
    @mousedown="onMouseDown"
    :class="[
      'flex flex-wrap gap-2 rounded-xl border-2 p-2 cursor-grab transition-all duration-100 h-full content-start',
      dragging
        ? 'border-blue-400 bg-blue-950/20 opacity-70'
        : 'border-gray-700 hover:border-blue-500',
    ]"
  >
    <div
      v-for="(path, i) in batchPaths"
      :key="i"
      class="flex flex-col items-center justify-center gap-1 rounded-lg bg-gray-800 p-2 pointer-events-none overflow-hidden"
      style="width: calc(33.333% - 6px); min-height: 100px;"
    >
      <Video :size="28" class="text-blue-400 shrink-0" />
      <div class="text-xs text-gray-300 text-center leading-tight line-clamp-2 w-full break-all px-1">
        {{ fileName(path) }}
      </div>
      <div v-if="metaCache[path]" class="text-[10px] text-gray-500">
        {{ metaCache[path].size_human }}
      </div>
    </div>

    <div
      v-if="dragging"
      class="col-span-full text-center text-blue-300 text-xs font-semibold py-1"
    >
      Dragging {{ batchPaths.length }} videos…
    </div>
  </div>
</template>
