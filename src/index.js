import * as snapsavePkg from 'snapsave-media-downloader';
const save = snapsavePkg.snapsave ?? snapsavePkg.default?.snapsave ?? snapsavePkg.default ?? snapsavePkg;

export function snapsave(url) {
  return save(url);
}

export default snapsave;
