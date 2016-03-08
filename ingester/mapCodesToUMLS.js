var umls = require('../modules/cde/node-js/vsac-io'),
    request = require('request'),
    mongoose = require('mongoose'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    config = require('config'),
    async = require('async')
;

var uri = "mongodb://" + config.database.appData.username + ":"
    +  config.database.appData.password + "@" +
    config.database.servers.map(function (srv) {
        return srv.host + ":" + srv.port;
    }).join(",") + "/" + config.database.appData.db;

var conn = mongoose.createConnection(uri, config.database.appData.options);
var Cache = conn.model('Cache', new mongoose.Schema({}, {strict: false}));
var DataElement = mongo_cde.DataElement;

var srcOptions = {
    NCI: {termType: "PT"},
    LNC: {termType: "LA"}
};

function getUMLSBySourceId(source, id, cb) {
    umls.getTicket(function(oneTimeTicket) {
        var url = "https://uts-ws.nlm.nih.gov/rest/search/current?ticket=" +
            oneTimeTicket + "&searchType=exact&returnIdType=concept&string=" + id + "&inputType=sourceUi&sabs=" + source;

        request.get(url, function(err, response, body) {
            if (response.statusCode === 200)
                cb(err, body);
            else {
                if (response.statusCode !== 404) {
                    console.log("Err " + response.statusCode + " -- " + err);
                }
                cb ("get UMLS - something happened." + err + "  --- " + response.statusCode);
            }
        });
    });
}

function getAtomFromUMLS(cui, source, cb) {
    umls.getTicket(function(oneTimeTicket) {
        var url = "https://uts-ws.nlm.nih.gov/rest/content/current/CUI/" + cui + "/atoms?sabs=" + source
            + "&pageSize=500&ticket=" + oneTimeTicket;
        request.get(url, function(err, response, body) {
            if (response.statusCode === 200)
                cb(err, body);
            else {
                if (response.statusCode !== 404) {
                    console.log("Err " + response.statusCode + " -- " + err);
                }
                cb ("getAtom - something happened." + err + "  --- " + response.statusCode);

            }


        });
    });
}

function startMapping() {
    var nbOfPvs = 0;
    var cdesTodo = 0;
    DataElement.find(
        {"valueDomain.permissibleValues.valueMeaningCode": {$exists: true}, archived: null,
            "valueDomain.permissibleValues.codeSystemName": {$nin: ['AHRQ Common Formats', 'UMLS', 'NA']}}).limit(50).stream()
        .on('data', function(cde) {
            cdesTodo++;
            console.log("starting CDE: " + cde.naming[0].designation);
            var allHaveCodes = true;
            cde.valueDomain.permissibleValues.forEach(function (pv) {
                if (!pv.valueMeaningCode || pv.valueMeaningCode.length === 0) {
                    allHaveCodes = false;
                }
            });
            if (allHaveCodes) {
                nbOfPvs += cde.valueDomain.permissibleValues.length;

                async.eachSeries(cde.valueDomain.permissibleValues, function (pv, onePvDone) {
                    var src;
                    if (!pv.codeSystemName || pv.codeSystemName.length === 0 || pv.codeSystemName === "NCI Thesaurus") {
                        src = "NCI";
                    } else if (pv.codeSystemName === 'LOINC') {
                        src = "LNC"
                    }
                    if (src) {
                        var pvCodes = [];
                        var vmNames = [];
                        async.eachSeries(pv.valueMeaningCode.split(":"), function(pvCode, oneCodeDone) {
                            getUMLSBySourceId(src, pv.valueMeaningCode, function(err, umlsResult) {
                                if (err) {
                                    pv.codeSystemName = "NA";
                                    return oneCodeDone(err);
                                }
                                else {
                                    umlsResult = JSON.parse(umlsResult);
                                    var cui = umlsResult.result.results[0].ui;
                                    var name = umlsResult.result.results[0].name;

                                    getAtomFromUMLS(cui, src, function(err, atomResult) {
                                        if (err) {
                                            pv.codeSystemName = "NA";
                                            return oneCodeDone(err);
                                        }
                                        atomResult = JSON.parse(atomResult);
                                        atomResult.result.forEach(function(atom) {
                                            if (atom.termType === srcOptions[src].termType) {
                                                vmNames.push(name);
                                                pvCodes.push(cui);
                                            } else {
                                                return onePvDone("At Least one code not the same.");
                                            }
                                        });
                                        oneCodeDone();
                                    });
                                }
                            })
                        }, function allCodesDones(err) {
                            if (err) return onePvDone(err);
                            else {
                                var finalName = vmNames.join(" ");
                                if (finalName.toLowerCase().trim() === pv.valueMeaningName.toLowerCase().trim()) {
                                    pv.valueMeaningName = finalName;
                                    pv.valueMeaningCode = pvCodes.join(":");
                                    pv.codeSystemName = "UMLS";
                                }
                                onePvDone();
                            }

                        });


                    } else {
                        onePvDone("Not a good src: " + pv.codeSystemName);
                    }
                }, function allPvsDone() {
                    cde.save(function(err) {
                        if (err) console.log("could not save CDE;" + err);
                        else {
                            console.log("CDE Saved ! " + cde.tinyId);
                        }
                        cdesTodo--;
                    });
                });
            } else {
                cdesTodo--;
            }
        }).on('end', function() {
        setInterval(function() {
            if (cdesTodo === 0) setTimeout(startMapping, 3000);
            else {
                console.log(cdesTodo + " cdes todo");
            }
        }, 2000)
    });
}

umls.getTGT(function() {
    startMapping();

});


