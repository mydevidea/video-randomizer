<script setup lang="ts">
import { Film, RefreshCw, CheckSquare, Hash } from "@lucide/vue";
import { useVideoStore } from "../stores/videoStore";

const store = useVideoStore();
</script>

<template>
  <div class="grid grid-cols-2 gap-2 p-3 bg-gray-800 rounded-lg text-sm">
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-1 text-gray-400"><Film :size="13" /> Total</span>
      <span class="text-white font-mono">{{ store.total.toLocaleString() }}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-1 text-gray-400"><Hash :size="13" /> Cycle</span>
      <span class="text-blue-400 font-mono font-bold">{{ store.cycle }}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-1 text-gray-400"><RefreshCw :size="13" /> Remaining</span>
      <span class="text-green-400 font-mono">{{ store.remaining.toLocaleString() }}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-1 text-gray-400"><CheckSquare :size="13" /> Used</span>
      <span class="text-orange-400 font-mono">{{ store.used.toLocaleString() }}</span>
    </div>
  </div>
</template>
