'use strict';

const app = require('express')();
const redis = require("redis");
const client = redis.createClient({
    host: '10.47.251.218',
    port: '6379'
});

const PORT = 3000;

app.disable('x-powered-by');

app.get('/', function (req, res) {
    res.send({
        message: 'Hello, World!'
    });
});

app.get('/search/:str', function (req, res) {
    client.get(req.params.str, function(err, reply) {
        // reply is null when the key is missing
        console.log('err: ', err, 'reply: ', reply);
    });
    res.send({
        message: 'You be searchin\', ' + req.params.str
    });
});

app.listen(PORT);

console.log('Running on http://localhost:' + PORT);
