'use strict';

require('dotenv').config()

const app = require('express')();

const trie = require('./trie');
const routes = require('./routes');
const CONSTANTS = require('./constants');
const bucketUtils = require('./bucket');

const gcs = require('@google-cloud/storage')(CONSTANTS.G_CONFIG);
const bucket = gcs.bucket(CONSTANTS.BUCKET_NAME);

let ready = false;

app.disable('x-powered-by');
routes(app, ready);

const resetTrie = () => {
  ready = false;
  bucketUtils.getLatestFromBucketIntoTrie(bucket, trie)
    .then(() => ready = true);
}

app.get('/_ready', function (req, res) {
  ready ?
    res.status(200).send() :
    res.status(404).send()
});

app.get('/reset', (req, res) => {
  resetTrie()
  res.status(200).send('resetting memory');
})

setInterval(function getLatest() {
  resetTrie();
  return getLatest;
}(), 1000 * 60 * 10);

app.listen(CONSTANTS.PORT);
