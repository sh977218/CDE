var mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    async = require('async')
;


var stream = mongo_cde.getStream({archived: false,
    retired: {$ne: 'Retired'},
    source: 'NINDS'
});

stream.on('data', (cde) => {
    stream.pause();

    // remove dups


    if (changed) {
        cde.save(() => stream.resume());
    } else {
        stream.resume();
    }

});

stream.on('end', () => {
   console.log("All Done");
   process.exit(0);
});