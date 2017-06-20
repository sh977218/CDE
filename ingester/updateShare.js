let xml2js = require('xml2js');
let _ = require('lodash');
let builder = new xml2js.Builder({attrkey: 'attribute'});
let Readable = require('stream').Readable;
let mongo_data = require('../modules/system/node-js/mongo-data');
let cdediff = require('../modules/cde/node-js/cdediff');
let classificationShared = require('../modules/system/shared/classificationShared');

exports.loaderUser = {
    username: 'batchloader'
};

exports.findEltIdVersion = function (elt, source) {
    let idVersions = [];
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
    let readable = new Readable();
    let xmlObj = JSON.parse(JSON.stringify(xml));
    delete xmlObj._id;
    delete xmlObj.index;
    delete xmlObj.xmlFile;
    let origXml = builder.buildObject(xmlObj).toString();
    readable.push(origXml);
    readable.push(null);
    mongo_data.addAttachment({
            originalname: elt.ids[0].id + "v" + elt.ids[0].version + ".xml",
            mimetype: "application/xml",
            size: origXml.length,
            stream: readable
        },
        {username: "batchloader", roles: ["AttachmentReviewer"]},
        "Original XML File", elt, function (attachment, newFileCreated, e) {
            if (e) throw e;
            cb(attachment, newFileCreated, e);
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
    let existingFormCopy = _.cloneDeep(existingForm);
    let newFormCopy = _.cloneDeep(newForm);
    exports.wipeUseless(existingForm);
    exports.wipeUseless(newFormCopy);
    classificationShared.sortClassification(newFormCopy);
    if (!existingFormCopy.classification) existingFormCopy.classification = [];
    for (let i = existingFormCopy.classification.length - 1; i > 0; i--) {
        if (existingFormCopy.classification[i].stewardOrg.name !== newFormCopy.source) {
            existingFormCopy.classification.splice(i, 1);
        }
    }
    if (_.isEmpty(existingFormCopy.classification)) existingFormCopy.classification = [];
    try {
        if (existingFormCopy.classification.length > 0) classificationShared.sortClassification(existingForm);
    } catch (e) {
        console.log(existingFormCopy);
        throw e;
    }
    return cdediff.diff(existingFormCopy, newFormCopy);
};

exports.removeClassificationTree = function (element, org) {
    for (let i = 0; i < element.classification.length; i++) {
        if (element.classification[i].stewardOrg.name === org) {
            element.classification.splice(i, 1);
            return;
        }
    }
};

exports.removeArrayOfSource = function (Array, source) {
    return Array.filter(function (p) {
        return !p.source || p.source !== source;
    });
};

exports.mergeNaming = function (eltMergeFrom, eltMergeTo) {
    eltMergeTo.naming = _.uniqWith(eltMergeTo.naming.concat(eltMergeFrom.naming), (a, b) => {
        if (a.designation === b.designation &&
            a.definition === b.definition &&
            a.definitionFormat === b.definitionFormat &&
            a.languageCode === b.languageCode &&
            a.source === b.source) {
            b.tags = _.concat(a.tags, b.tags);
            return true;
        } else return false;
    });
    _.forEach(eltMergeTo.naming, naming => {
        naming.tags = _.uniqWith(naming.tags, (a, b) => {
            return a.tag === b.tag;
        });
    });
};

exports.mergeReferenceDocument = function (eltMergeFrom, eltMergeTo) {
    eltMergeTo.referenceDocuments = eltMergeFrom.referenceDocuments.concat(_.differenceWith(eltMergeTo.referenceDocuments, eltMergeFrom.referenceDocuments,
        (a, b) => a.source && b.source && a.title === b.title));
};
exports.mergeProperties = function (eltMergeFrom, eltMergeTo) {
    let temp = _.differenceWith(eltMergeTo.properties, eltMergeFrom.properties,
        (a, b) => {
            return a.source && b.source && a.key === b.key;
        });
    eltMergeTo.properties = eltMergeFrom.properties.concat(temp);
};
exports.mergeSources = function (eltMergeFrom, eltMergeTo) {
    eltMergeTo.sources = eltMergeFrom.sources.concat(_.differenceWith(eltMergeTo.sources, eltMergeFrom.sources,
        (a, b) => a.sourceName === b.sourceName));
};

exports.mergeIds = function (eltMergeFrom, eltMergeTo) {
    eltMergeTo.ids = eltMergeFrom.ids.concat(_.differenceWith(eltMergeTo.ids, eltMergeFrom.ids,
        (a, b) => a.source === b.source && a.id === b.id));
};
exports.mergeReferenceDocument = function (eltMergeFrom, eltMergeTo) {
    eltMergeTo.referenceDocuments = eltMergeFrom.referenceDocuments.concat(_.differenceWith(eltMergeTo.referenceDocuments, eltMergeFrom.referenceDocuments,
        (a, b) => a.title === b.title && a.source && b.source));
};
exports.mergeClassification = function (eltMergeFrom, eltMergeTo) {
    eltMergeTo.classification = eltMergeFrom.classification.concat(_.differenceWith(eltMergeTo.classification, eltMergeFrom.classification,
        (a, b) => a.stewardOrg.name === b.stewardOrg.name));
};


