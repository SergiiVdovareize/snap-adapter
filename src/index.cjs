let _snapsave;
async function _getSnapsave() {
  if (!_snapsave) {
    const pkg = await import('./index.js');
    _snapsave = pkg.snapsave ?? pkg.default?.snapsave ?? pkg.default ?? pkg;
  }
  return _snapsave;
}

async function snapsave(url, options) {
  const save = await _getSnapsave();
  return save(url, options);
}

module.exports = snapsave;
module.exports.snapsave = snapsave;
module.exports.default = snapsave;
