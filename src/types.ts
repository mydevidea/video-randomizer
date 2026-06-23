export interface VideoFile {
  path: string;
  name: string;
  size: number;
  size_human: string;
}

export interface AppState {
  folderPath: string | null;
  videos: string[]; // paths only, lazy metadata
  usedIndices: number[];
  currentIndex: number | null;
  cycle: number;
  shuffledQueue: number[];
}
