const mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    _ = require('lodash')
;

let stream = mongo_cde.getStream({archived: false,
    retired: {$ne: 'Retired'},
    source: 'NINDS'
});

let count = 0;
let changedCount = 0;

stream.on('data', cde => {

    if (count++ % 100 === 0) console.log(count + " -- Changed " + changedCount);
    stream.pause();

    let flatNames = cde.naming.map(n => n.designation + "<<==>>" + (n.definition?n.definition:""));

    let changed = false;
    flatNames.forEach((fn, i) => {
        if (flatNames.indexOf(fn) !== i) {
            // console.log("found dup: " + fn);
            let dupInd = flatNames.indexOf(fn);
            let mergeTags = false;
            if (!cde.naming[dupInd].source || cde.naming[dupInd].source === "") {
                cde.naming[dupInd].source = cde.naming[i].source;
                mergeTags = true
            } else if (!cde.naming[i].source || cde.naming[i].source === ""
                || cde.naming[i].source === cde.naming[dupInd].source) {
                mergeTags = true;
            }

            if (mergeTags) {
                cde.naming[dupInd].tags = _.uniq(cde.naming[dupInd].tags.concat(cde.naming[i].tags))
                    // .map(t => t.tag)).map(t => {return {tag: t}});
                cde.naming[i] = "";
                changed = true;
            }
        }
    });

    if (changed) {
        cde.naming = cde.naming.filter(n => n !== "");
        mongo_cde.update(cde, {username: "batch"}, err => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            changedCount++;
            stream.resume();
        });
    } else {
        stream.resume();
    }

});

stream.on('end', () => {
   console.log("All Done");
   process.exit(0);
});