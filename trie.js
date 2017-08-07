const pretree = require('trie-prefix-tree-serialize');
const constants = require('./constants');
const tree = pretree([]);

module.exports = {
  getMatches: (str) => tree.getPrefix(str).slice(0, constants.LIMIT),
  loadFromBuffer: (data) => tree.load(JSON.parse(data.toString()))
}