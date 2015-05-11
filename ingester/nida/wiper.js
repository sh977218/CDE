var mongo_cde = require('../../modules/cde/node-js/mongo-cde')
    , classificationShared = require('../../modules/system/shared/classificationShared')
    ;


setTimeout(function() {
    mongo_cde.query({"classification.stewardOrg.name":"NIDA"}, function(err, result) {
        result.forEach(function(cde) {
            var steward = classificationShared.findSteward(cde, "NIDA");
            //if (steward) steward.object.elements = [];
            cde.classification.splice(steward.index, 1);
            cde.save(function(err, cde) {
                if (err) throw "Cannot save";
                console.log("Wiped NIDA classifications for: " + cde.naming[0].designation);
            });
        });
    });
}, 1000);


