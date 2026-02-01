let _save;
async function _getSave() {
  if (!_save) {
    const pkg = await import('snapsave-media-downloader');
    _save = pkg.snapsave ?? pkg.default?.snapsave ?? pkg.default ?? pkg;
  }
  return _save;
}

async function snapsave(url) {
  const save = await _getSave();
  return save(url);
}

module.exports = snapsave;
module.exports.snapsave = snapsave;
module.exports.default = snapsave;
