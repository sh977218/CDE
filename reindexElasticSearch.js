const esInit = require('./server/system/elasticSearchInit');
const elastic = require('./server/system/elastic');

(function () {
    let allReindex = esInit.indices.map(i => {
        console.log('Inject Index: ' + i.indexName);
        return new Promise((resolve, reject) => {
            elastic.reIndex(i, function (err) {
                if (err) reject();
                else resolve();
            })
        })
    });
    Promise.all(allReindex)
        .then(() => {
            console.log('Reindex Elastic Search Done');
            process.exit(0);
        })
        .catch(function (e) {
            process.exit(1);
        });
})();
