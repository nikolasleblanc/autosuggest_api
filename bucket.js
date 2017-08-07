const mapBucketFiles = (files) => files.map(file => ({
  id: file.id,
  timeCreated: file.metadata.timeCreated
}));

const throwIfEmpty = (files) => {
  if (!files.length) {
    throw new Error(`No files found in bucket ${CONSTANTS.BUCKET_NAME}`);
  }
  return files;
}

const sortFiles = (files) => {
  files.sort(fileComparator)
  return files;
}

const fileComparator = (a, b) => {
  if (a.timeCreated < b.timeCreated) {
    return 1;
  }
  if (a.timeCreated > b.timeCreated) {
    return -1;
  }
  return 0;
}

const getFiles = data => (data[0] && data[0].length && data[0]) || [];

const getMostRecentFile = (bucket) => {
  return bucket.getFiles()
    .then(getFiles)
    .then(throwIfEmpty)
    .then(mapBucketFiles)
    .then(sortFiles)
    .then(files => files[0]);
}

const doReadBucket = (bucket, filename) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    bucket.file(filename).createReadStream()
      .on('error', (err) => {
        reject(err);
      })
      .on('data', (data) => {
        if (data !== '') {
          chunks.push(data);
        }
      })
      .on('end', function () {
        resolve(Buffer.concat(chunks));
      })
  });
}

const getLatestFromBucketIntoTrie = (bucket, trie) => {
  console.log('Loading new data from bucket');
  return getMostRecentFile(bucket)
    .then(file => doReadBucket(bucket, file.id))
    .then(trie.loadFromBuffer)
    .then(() => console.log('New data loaded from bucket'))
    .catch(err => console.log(err));
}

module.exports = {
  getLatestFromBucketIntoTrie
}