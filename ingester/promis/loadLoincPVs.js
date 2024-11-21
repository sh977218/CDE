var loincMapping = require('./loinc-mapping'),
    async = require('async');

var notFound = {};

exports.loadPvs = function (cdeArray, doneWithLoad) {
    async.each(cdeArray, function (cde, cb) {
        cde.valueDomain.permissibleValues.forEach(function (pv) {
            var mapping = loincMapping.getMapping(pv.valueMeaningName);
            if (mapping) {
                pv.valueMeaningName = mapping.value;
                pv.valueMeaningCode = mapping.code;
                pv.codeSystemName = "LOINC";
            } else {
                if (notFound[pv.valueMeaningName] > 0) {
                    notFound[pv.valueMeaningName]++;
                } else {
                    notFound[pv.valueMeaningName] = 1;
                }
            }
        });
        cde.save(function (err) {
            if (err) {
                console.log("error updating CDE with loinc codes: " + err);
                process.exit(0);
            } else {
                cb();
            }
        })
    }, function (err) {
        if (err) {
            console.log("Unable to attach loinc codes to permissible Values. " + err);
            process.exit(1);
        } else {
            console.log("These Values were not found");
            console.log(JSON.stringify(notFound));
            doneWithLoad();
        }
    });
};

