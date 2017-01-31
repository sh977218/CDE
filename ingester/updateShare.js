var xml2js = require('xml2js'),
    builder = new xml2js.Builder({attrkey: 'attribute'}),
    Readable = require('stream').Readable,
    mongo_data = require('../modules/system/node-js/mongo-data'),
    cdediff = require('../modules/cde/node-js/cdediff'),
    classificationShared = require('../modules/system/shared/classificationShared')
    ;

exports.findEltIdVersion = function (elt, source) {
    var idVersions = [];
    if (!elt.ids || elt.ids.length === 0) {
        throw 'No ids in elt: ' + elt.tinyId;
    } else {
        elt.ids.forEach(function (id) {
            if (id.source === source) {
                idVersions.push({id: id.id, version: id.version});
            }
        });
        return idVersions;
    }
};

exports.addAttachment = function (elt, xml, cb) {
    var readable = new Readable();
    var xmlObj = JSON.parse(JSON.stringify(xml));
    delete xmlObj._id;
    delete xmlObj.index;
    delete xmlObj.xmlFile;
    var origXml = builder.buildObject(xmlObj).toString();
    readable.push(origXml);
    readable.push(null);
    mongo_data.addAttachment(
        {
            originalname: elt.ids[0].id + "v" + elt.ids[0].version + ".xml",
            mimetype: "application/xml",
            size: origXml.length,
            stream: readable
        },
        {username: "batchloader", roles: ["AttachmentReviewer"]},
        "Original XML File", elt, function (attachment, newFileCreated, e) {
            if (e) throw e;
            cb();
        });
};

exports.wipeUseless = function (toWipe) {
    delete toWipe._id;
    delete toWipe.history;
    delete toWipe.imported;
    delete toWipe.created;
    delete toWipe.createdBy;
    delete toWipe.updated;
    delete toWipe.comments;
    delete toWipe.tinyId;
    delete toWipe.changeNote;
    delete toWipe.attachments;
    delete toWipe.lastMigrationScript;
    if (toWipe.origin === '') delete toWipe.origin;
    if (toWipe.valueDomain)
        delete toWipe.valueDomain.datatypeValueList;

    Object.keys(toWipe).forEach(function (key) {
        if (Array.isArray(toWipe[key]) && toWipe[key].length === 0) {
            delete toWipe[key];
        }
    });
};


exports.compareObjects = function (existingForm, newForm) {
    existingForm = JSON.parse(JSON.stringify(existingForm));
    exports.wipeUseless(existingForm);
    for (var i = existingForm.classification.length - 1; i > 0; i--) {
        if (existingForm.classification[i].stewardOrg.name !== newForm.source) {
            existingForm.classification.splice(i, 1);
        }
    }
    if (existingForm.classification == [null]) existingForm.classification = [];
    try {
        if (existingForm.classification.length > 0) classificationShared.sortClassification(existingForm);
    } catch (e) {
        console.log(existingForm);
        throw e;
    }
    classificationShared.sortClassification(newForm);
    newForm = JSON.parse(JSON.stringify(newForm));
    exports.wipeUseless(newForm);
    return cdediff.diff(existingForm, newForm);
};

exports.removeClassificationTree = function (element, org) {
    for (var i = 0; i < element.classification.length; i++) {
        if (element.classification[i].stewardOrg.name === org) {
            element.classification.splice(i, 1);
            return;
        }
    }
};

exports.removeArrayOfSource = function (Array, source) {
    var newArray = Array.filter(function (p) {
        return !p.source || p.source !== source;
    });
    return newArray;
};

exports.mergeSources = function (sources, migrationSources) {
    for (var i = 0; i < migrationSources.length; i++) {
        var migrationSource = migrationSources[i];
        for (var j = 0; j < sources.length; j++) {
            var source = sources[j];
            if (source.sourceName === migrationSource.sourceName) {
                sources[j] = migrationSource;
            }
        }
    }
};