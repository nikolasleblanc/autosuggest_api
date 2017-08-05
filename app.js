'use strict';

const app = require('express')();
const redis = require("redis");

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
    res.send({
        message: 'Hello, World!'
    });
});

app.get('/search/:str', function (req, res) {
    slave.get(req.params.str, function(err, reply) {
        res.send({
            message: 'You be searchin\', ' + req.params.str + ' ' + reply
        });
        // reply is null when the key is missing
        console.log('err: ', err, 'reply: ', reply);
    });
});

app.listen(PORT);

master.set('nikolas', 'so hot');

console.log('Running on http://localhost:' + PORT);
