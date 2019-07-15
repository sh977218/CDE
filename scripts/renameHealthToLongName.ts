import { eachSeries } from 'async';
import { byId, getStream, update } from '../server/cde/mongo-cde';

const idList = [];
let i = 0;

getStream({
    archived: false,
    retired: {$ne: 'Retired'},
    source: 'caDSR'
})
    .on('data', function (cde) {
        idList.push(cde._id);
        console.log(idList.length);
    })
    .on('close', function () {
        console.log(idList.length + " todo");
        eachSeries(idList, function (id, oneDone) {
            byId(id, function (err, cde) {

                cde.naming.forEach(function (n) {
                    if (n.tags) {
                        n.tags.forEach(function (t) {
                            if (t.tag === 'Health') t.tag = "Long Name";
                        });
                    }
                });

                cde.changeNote = "Modified Tag from Health to Long Name";

                update(cde, {username: "batchloader"}, function (err) {
                    if (err) {
                        console.log(err);
                        process.exit(1);
                    }
                    console.log("updated: " + cde.tinyId + "  " + i / idList.length + " %");
                    oneDone();
                    i++;
                });
            });
        }, function (err) {
            console.log("All Done");
            console.log(i);
            process.exit(0);
        });
    });
