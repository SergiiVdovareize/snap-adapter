export async function snapsave(url: string): Promise<any> {
  const { snapsave: save } = await import('snapsave-media-downloader');
  return save(url);
}
