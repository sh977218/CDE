var schemas = require('../../modules/system/node-js/schemas.js')
    , mongoose = require('mongoose')
    config = require('config')

var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
Org = conn.model('Org', schemas.orgSchema);

Org.findOne({"name": "NCI"}, function (err, nciOrg) {
    Org.findOne({"name": "PhenX"}, function (err, phenXOrg) {
        nciOrg.classifications.forEach(function(nciClassif) {
            if (nciClassif.name === "caBIG") {
                nciClassif.elements.push(phenXOrg.classifications[0]);
                nciClassif.save(function(err) {
                    if (err) console.log(err);
                    process.exit(0);
                })
            }
        })
    });
});

