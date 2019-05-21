const esInit = require('./server/system/elasticSearchInit');
const elastic = require('./server/system/elastic');

let allReindex = esInit.indices.map(i => {
    console.log('Inject Index: ' + i.indexName);
    return new Promise((resolve, reject) => {
        elastic.reIndex(i, err => {
            if (err) reject();
            else resolve();
        })
    })
});
Promise.all(allReindex)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
