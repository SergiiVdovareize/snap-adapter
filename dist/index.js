export async function snapsave(url) {
    const { snapsave: save } = await import('snapsave-media-downloader');
    return save(url);
}
