<script setup lang="ts">
import { onMounted } from "vue";
import { useVideoStore } from "./stores/videoStore";
import StatsBar from "./components/StatsBar.vue";
import VideoPreview from "./components/VideoPreview.vue";
import Controls from "./components/Controls.vue";
import SettingsModal from "./components/SettingsModal.vue";

const store = useVideoStore();
onMounted(() => store.restore());
</script>

<template>
  <div class="w-full h-full bg-gray-900 text-white flex flex-col p-4 gap-3 select-none overflow-hidden">
    <!-- Header -->
    <div class="flex justify-end">
      <SettingsModal />
    </div>

    <!-- Stats -->
    <StatsBar v-if="store.total > 0" />

    <!-- Video grid -->
    <VideoPreview class="flex-1 min-h-0" />

    <!-- Controls -->
    <Controls />

    <!-- Hint -->
    <p class="text-center text-xs text-gray-700">
      Drag the grid into Facebook's upload area — all {{ store.batchSize }} videos at once
    </p>
  </div>
</template>
