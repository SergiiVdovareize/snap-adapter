// src/index.ts
export async function snapSave(url: string) {
  const { default: SnapSave } = await import('snapsave-media-downloader');
  return SnapSave(url);
}
