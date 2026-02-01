const snapsavePkg = require('snapsave-media-downloader');
const save = snapsavePkg && (snapsavePkg.snapsave || (snapsavePkg.default && snapsavePkg.default.snapsave) || snapsavePkg.default || snapsavePkg);

function snapsave(url) {
  return save(url);
}

module.exports = snapsave;
module.exports.snapsave = snapsave;
module.exports.default = snapsave;
