const PROJECT_ID = process.env.MY_PROJECT_ID;
const KEYFILE = process.env.MY_KEYFILE;
const LIMIT = process.env.LIMIT;
const IS_GCE = process.env.KUBERNETES_PORT_443_TCP_PROTO;
const BUCKET_NAME = process.env.BUCKET;
const PORT = process.env.PORT;

module.exports = {
  SLAVE_CONFIG: {
    host: 'redis-slave.default',
    port: '6379'
  },
  MASTER_CONFIG: {
    host: IS_GCE ? 'redis-master.default' : 'localhost',
    port: '6379'
  },
  LIMIT: LIMIT || 25,
  G_CONFIG: IS_GCE ? {} : {
    projectId: PROJECT_ID,
    keyFilename: KEYFILE
  },
  BUCKET_NAME,
  PORT: PORT
}