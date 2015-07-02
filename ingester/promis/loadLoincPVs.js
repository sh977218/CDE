var loincMapping = require('./loinc-mapping'),
    async = require('async')

var notFound = {};

exports.loadPvs = function(cdeArray, doneWithLoad) {
    async.each(cdeArray.cdearray, function(cde, cb) {
        cde.valueDomain.permissibleValues.forEach(function(pv) {
             if (loincMapping[pv.valueMeaningName]) {
                 pv.valueMeaningCode = loincMapping[pv.valueMeaningName];
                 pv.valueMeaningCodeSystem = "LOINC";
             } else {
                 if (notFound[pv.valueMeaningName]) {
                     notFound[pv.valueMeaningName]++;
                 } else {
                     notFound[pv.valueMeaningName] = 0;
                 }
             }
        });
        cde.save(function(err) {
            if (err) {
                console.log("error updating CDE with loinc codes: " + err);
                process.exit(0);
            } else {
                cb();
            }
        })
    }, function(err) {
        if (err) {
            console.log("Unable to attach loinc codes to permissible Values. " + err);
            process.exit(1);
        } else {
            doneWithLoad();
        }
    });
};

