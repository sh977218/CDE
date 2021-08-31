var mongo_cde = require('../../server/cde/mongo-cde');
import { findSteward } from 'shared/classification/classificationShared';

setTimeout(function() {
    mongo_cde.query({"classification.stewardOrg.name":"NIDA"}, function(err, result) {
        result.forEach(function(cde) {
            var steward = findSteward(cde, "NIDA");
            cde.classification.splice(steward.index, 1);
            cde.save(function(err, cde) {
                if (err) throw "Cannot save";
                console.log("Wiped NIDA classifications for: " + cde.naming[0].designation);
            });
        });
    });
}, 1000);
