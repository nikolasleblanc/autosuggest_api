const DELIMITER = process.env.DELIMETER || '****-----****';
const LIMIT = process.env.LIMIT || 25;
const trie = require('./trie');
const CONSTANTS = require('./constants');
const redis = require('redis');
const master = redis.createClient(CONSTANTS.MASTER_CONFIG);
const slave = process.env.KUBERNETES_PORT_443_TCP_PROTO ? redis.createClient(CONSTANTS.SLAVE_CONFIG) : master;

module.exports = function(app, ready){
  app.get('/', function (req, res) {
    res.send(process.env);
  });

  app.get('/search', function (req, res) {
    res.send([]);
  });

  app.get('/flush', (req, res) => {
    master.flushall();
    res.send('flushing');
  })

  app.get('/search/:str', function (req, res) {
    const str = req.params.str;
    slave.get(req.params.str, function (err, reply) {
      if (err) {
        console.log('redis error', err);
      } else {
        if (reply === null) {
          const matches = trie.getMatches(str);
          master.set(str, matches.join(DELIMITER));
          master.expire(str, 60 * 10)
          console.log(str, 'got it from memory')
          res.send(matches);
        } else {
          console.log(str, 'got it from redis')
          res.send(reply.split(DELIMITER));
        }
      }
    });
  });
}