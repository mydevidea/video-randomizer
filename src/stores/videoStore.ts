import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";
import type { VideoFile } from "../types";

const STORE_FILE = "app-state.json";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useVideoStore = defineStore("video", () => {
  const folders = ref<string[]>([]);
  const videoPaths = ref<string[]>([]);
  // queue of indices 0..N-1, pre-shuffled
  const queue = ref<number[]>([]);
  const queuePos = ref(0);
  const cycle = ref(1);
  const batch = ref<number[]>([]);
  const batchSize = ref(7);
  const scanning = ref(false);

  const total = computed(() => videoPaths.value.length);
  const used = computed(() => queuePos.value + (cycle.value - 1) * total.value);
  const remaining = computed(() => Math.max(0, total.value - queuePos.value));

  function fillBatch() {
    if (total.value === 0) { batch.value = []; return; }
    const count = Math.min(batchSize.value, total.value);
    const next: number[] = [];
    const usedInBatch = new Set<number>();
    while (next.length < count) {
      // Refill queue if exhausted
      if (queuePos.value >= queue.value.length) {
        cycle.value++;
        queue.value = shuffle(Array.from({ length: total.value }, (_, i) => i));
        queuePos.value = 0;
      }
      const idx = queue.value[queuePos.value++];
      if (!usedInBatch.has(idx)) {
        usedInBatch.add(idx);
        next.push(idx);
      }
    }
    batch.value = next;
    console.log('[fillBatch] count:', count, 'batch:', JSON.stringify(batch.value));
  }

  // Debounced persist — only write the latest state
  let persistTimer: ReturnType<typeof setTimeout> | null = null;
  function schedulePersist() {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(async () => {
      const store = await load(STORE_FILE);
      await store.set("folders", folders.value);
      await store.set("videoPaths", videoPaths.value);
      await store.set("queue", queue.value);
      await store.set("queuePos", queuePos.value);
      await store.set("cycle", cycle.value);
      await store.set("batchSize", batchSize.value);
      // don't persist batch — always recompute on restore
      await store.save();
    }, 300);
  }

  async function restore() {
    try {
      const store = await load(STORE_FILE);
      const fo = await store.get<string[]>("folders");
      const vp = await store.get<string[]>("videoPaths");
      const q = await store.get<number[]>("queue");
      const qp = await store.get<number>("queuePos");
      const cy = await store.get<number>("cycle");
      const bs = await store.get<number>("batchSize");
      if (fo?.length) folders.value = fo;
      if (vp?.length) videoPaths.value = vp;
      if (q?.length) queue.value = q;
      if (qp != null) queuePos.value = qp;
      if (cy != null) cycle.value = cy;
      if (bs != null) batchSize.value = bs;
      // Always recompute batch from current state — never load stale batch
      if (total.value > 0) fillBatch();
    } catch {
      // fresh start
    }
  }

  async function addFolder() {
    const path = await invoke<string | null>("select_folder");
    if (!path || folders.value.includes(path)) return;
    folders.value.push(path);
    await rescanAll();
  }

  async function removeFolder(path: string) {
    folders.value = folders.value.filter((f) => f !== path);
    await rescanAll();
  }

  async function rescanAll() {
    scanning.value = true;
    const allFiles: VideoFile[] = [];
    for (const folder of folders.value) {
      const files = await invoke<VideoFile[]>("scan_videos", { folder });
      allFiles.push(...files);
    }
    videoPaths.value = allFiles.map((f) => f.path);
    queue.value = shuffle(Array.from({ length: videoPaths.value.length }, (_, i) => i));
    queuePos.value = 0;
    cycle.value = 1;
    fillBatch();
    scanning.value = false;
    schedulePersist();
  }

  function setBatchSize(n: number) {
    batchSize.value = Math.max(1, Math.min(50, n));
    if (total.value > 0) fillBatch();
    schedulePersist();
  }

  function refreshBatch() {
    if (!total.value) return;
    fillBatch();
    schedulePersist();
  }

  async function getMetadata(path: string): Promise<VideoFile> {
    return invoke<VideoFile>("get_video_metadata", { path });
  }

  async function revealFile(path: string) {
    await invoke("reveal_file", { path });
  }

  async function openFolder(path: string) {
    await invoke("open_folder", { path });
  }

  return {
    folders,
    videoPaths,
    cycle,
    batch,
    batchSize,
    scanning,
    total,
    used,
    remaining,
    restore,
    addFolder,
    removeFolder,
    setBatchSize,
    refreshBatch,
    getMetadata,
    revealFile,
    openFolder,
  };
});
