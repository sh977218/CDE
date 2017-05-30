const mongo_cde = require('../modules/cde/node-js/mongo-cde')
    _ = require('lodash')
;


let stream = mongo_cde.getStream({archived: false,
    retired: {$ne: 'Retired'},
    source: 'NINDS'
});



stream.on('data', (cde) => {
    stream.pause();

    let changed = false;

    let flatNames = cde.naming.map(n => n.designation + "<<==>>" + n.definition);

    flatNames.forEach((fn, i) => {
        let changed = false;
        if (flatNames.indexOf(fn) !== i) {
            let dupInd = flatNames.indexOf(fn);
            let mergeTags = false;
            if (!cde.naming[dupInd].source || cde.naming[dupInd].source === "") {
                cde.naming[dupInd].source = cde.naming[i].source;
                mergeTags = true
            } else if (!cde.naming[i].source || cde.naming[i].source === "" || cde.naming[i].source === cde.naming[dupInd].source) {
                mergeTags = true;
            }

            if (mergeTags) {
                cde.naming[dupInd].tags = _.uniq(cde.naming[dupInd].tags.concat(cde.naming[i].tags));
                cde.naming[i] = "";
                changed = false;
            }
        }
    });

    if (changed) {
        cde.naming = cde.naming.filter(n => n !== "");
        cde.save(() => stream.resume());
    } else {
        stream.resume();
    }

});

stream.on('end', () => {
   console.log("All Done");
   process.exit(0);
});