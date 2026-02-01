import { snapsave as save } from 'snapsave-media-downloader';

export function snapsave(url) {
  return save(url);
}

export default snapsave;
