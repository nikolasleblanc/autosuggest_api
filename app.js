'use strict';

const app = require('express')();

const PORT = 3000;

app.disable('x-powered-by');

app.get('/', function (req, res) {
    res.send({
        message: 'Hello, World!'
    });
});

app.get('/search/:str', function (req, res) {
    res.send({
        message: 'You be searchin\', ' + req.params.str
    });
});

app.listen(PORT);

console.log('Running on http://localhost:' + PORT);
