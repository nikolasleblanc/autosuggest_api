'use strict';

const config = {};

const app = require('express')();
const redis = require("redis");
const gcs = require('@google-cloud/storage')(config);
const bucket = gcs.bucket('bestbuymulti');
const pretree = require('trie-prefix-tree-serialize');

let tree = pretree([]);

let ready = false;

const doReadBucket = () => {
  const chunks = [];
  bucket.file('output_trie.json').createReadStream()
  //fs.createReadStream('output_trie.json')
    .on('error', (err) => {
      console.log('err', err);
    })
    .on('data', (data) => {
      if (data !== '') {
        chunks.push(data);
      }
    })
    .on('end', function() {
      const final = Buffer.concat(chunks);
      tree.load(JSON.parse(final.toString()));
      console.log('done loading');
      ready = true;
    })
}

const slaveConfig = {
    host: '10.47.251.218',
    port: '6379'
}

const masterConfig = {
    host: '10.47.246.251',
    port: '6379'
}

const slave = redis.createClient(slaveConfig);
const master = redis.createClient(masterConfig);

const PORT = 3000;

app.disable('x-powered-by');

app.get('/', function (req, res) {
    res.send(process.env);
});

app.get('/_ready', function (req, res) {
    ready ?
        res.status(200).send() :
        res.status(404).send()
});

app.get('/search/:str', function (req, res) {
    const str = req.params.str;
    slave.get(req.params.str, function(err, reply) {
        if (reply === null) {
            const matches = tree.getPrefix(str)
            master.set(str, matches);
            res.send(matches);
        } else {
            res.send(reply);
        }
    });
});

app.listen(PORT);

master.set('nikolas', 'so hot');
doReadBucket();

console.log('Running on http://localhost:' + PORT);
