<script setup lang="ts">
import { ref, watch } from "vue";
import { X, FolderPlus, Trash2, Settings } from "@lucide/vue";
import { useVideoStore } from "../stores/videoStore";

const store = useVideoStore();
const open = ref(false);
const sizeInput = ref(store.batchSize);

watch(() => store.batchSize, (v) => (sizeInput.value = v));

function applySize() {
  const n = parseInt(String(sizeInput.value));
  if (!isNaN(n)) store.setBatchSize(n);
}
</script>

<template>
  <!-- Trigger -->
  <button
    @click="open = true"
    class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
    title="Settings"
  >
    <Settings :size="18" />
  </button>

  <!-- Modal -->
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      @click.self="open = false"
    >
      <div class="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 class="font-semibold text-white flex items-center gap-2">
            <Settings :size="16" /> Settings
          </h2>
          <button @click="open = false" class="text-gray-500 hover:text-white">
            <X :size="18" />
          </button>
        </div>

        <div class="p-4 space-y-5">
          <!-- Batch size -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Videos per batch</label>
            <div class="flex gap-2">
              <input
                v-model.number="sizeInput"
                type="number"
                min="1"
                max="50"
                class="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                @keydown.enter="applySize"
              />
              <button
                @click="applySize"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
            <p class="text-xs text-gray-600 mt-1">Default: 7 · Max: 50</p>
          </div>

          <!-- Folders -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm text-gray-400">Video folders</label>
              <button
                @click="store.addFolder()"
                :disabled="store.scanning"
                class="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs rounded-lg transition-colors"
              >
                <FolderPlus :size="14" /> Add Folder
              </button>
            </div>

            <div v-if="!store.folders.length" class="text-xs text-gray-600 py-2">
              No folders added yet.
            </div>

            <ul class="space-y-1 max-h-48 overflow-y-auto">
              <li
                v-for="f in store.folders"
                :key="f"
                class="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 text-xs"
              >
                <span class="text-gray-300 truncate mr-2">{{ f }}</span>
                <button
                  @click="store.removeFolder(f)"
                  class="text-gray-600 hover:text-red-400 shrink-0 transition-colors"
                >
                  <Trash2 :size="14" />
                </button>
              </li>
            </ul>

            <p v-if="store.scanning" class="text-xs text-blue-400 mt-2 animate-pulse">
              Scanning…
            </p>
            <p v-else-if="store.total > 0" class="text-xs text-gray-600 mt-2">
              {{ store.total.toLocaleString() }} videos found
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
