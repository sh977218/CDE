const mongo_cde = require('../modules/cde/node-js/mongo-cde')
;


let stream = mongo_cde.getStream({archived: false,
    retired: {$ne: 'Retired'},
    source: 'NINDS'
});

findSameName (n) {

}

stream.on('data', (cde) => {
    stream.pause();


    cde.naming.forEach(n => {

    });
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