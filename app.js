'use strict';

const projectId = 'bbtest-175601'; // E.g. 'grape-spaceship-123'
const keyFilename = 'key.json';

const config = process.env.KUBERNETES_PORT_443_TCP_PROTO ? {} : {
  projectId,
  keyFilename
};

const redisHost = process.env.KUBERNETES_PORT_443_TCP_PROTO ? 'redis-host.default' : 'localhost'

const app = require('express')();
const redis = require("redis");
const gcs = require('@google-cloud/storage')(config);
const bucket = gcs.bucket('bestbuymulti');
const pretree = require('trie-prefix-tree-serialize');
const dest = gcs.bucket('bestbuymulti_trie');

let tree = pretree([]);

let ready = false;

const getMostRecentFile = () => {
    const promise = new Promise((resolve, reject) => {
        dest.getFiles(function(err, files) {
            if (!err && files.length) {
                files = files.map(file => {
                    return {
                        id: file.id, timeCreated: file.metadata.timeCreated
                    }
                })
                files.sort((a, b) => {
                    if (a.timeCreated < b.timeCreated) {
                        return 1;
                    }
                    if (a.timeCreated > b.timeCreated) {
                        return -1;
                    }
                    return 0;
                })
                resolve(files);
            } else {
                reject();
            }
        });
    });
    return promise;
}

const doReadBucket = (filename) => {
  const file = filename || 'output_trie.json';
  const chunks = [];
  dest.file(file).createReadStream()
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
    host: 'redis-slave.default',
    port: '6379'
}

const masterConfig = {
    host: redisHost,
    port: '6379'
}

const master = redis.createClient(masterConfig);
const slave = process.env.KUBERNETES_PORT_443_TCP_PROTO ? redis.createClient(slaveConfig) : master;

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

const DELIMITER = '****-----****';
const LIMIT = 25;

app.get('/search', function(req, res) {
    res.send([]);
});

app.get('/flush', (req, res) => {
    master.flushall();
    res.send('flushing');
})

app.get('/reset', (req, res) => {
    ready = false;
    getMostRecentFile()
        .then(fileName => doReadBucket(fileName));
    res.status(200).send('resetting memory');
})

app.get('/', function(req, res) {
    res.send(process.env);
});

app.get('/search/:str', function (req, res) {
    const str = req.params.str;
    slave.get(req.params.str, function(err, reply) {
        if (err) {
            console.log('redis error', err);
        } else {
            if (reply === null) {
                const matches = tree.getPrefix(str).slice(0, LIMIT);
                master.set(str, matches.join(DELIMITER));
                console.log(str, 'got it from memory')
                res.send(matches);
            } else {
                console.log(str, 'got it from redis')
                res.send(reply.split(DELIMITER));
            }
        }
    });
});

app.listen(PORT);

master.set('nikolas', 'so hot');

getMostRecentFile()
    .then(files => files[0])
    .then(file => doReadBucket(file.id));

console.log('Running on http://localhost:' + PORT);

var fetch = require('node-fetch');

fetch('http://api-service.default:3000/search/a')
    .then(a => console.log('got this working maybe', a.json()))
    .then(a => console.log(a))
    .catch(err => console.log('nope', err));
