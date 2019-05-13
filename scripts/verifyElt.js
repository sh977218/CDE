exports.cleanup = process.argv[2] === 'fix';
exports.errors = [];
exports.count = 0;
exports.fixed = 0;

exports.fixElt = function fixElt(elt) {
    let changed = false;

    if (elt.classification) {
        const classificationBySteward = {};
        for (let i = 0; i < elt.classification.length; i++) {
            const c = elt.classification[i];
            if (!c || !c.elements || c.elements.length === 0) {
                elt.classification.splice(i, 1);
                i--;
                changed = true;
            }
            if (!c.stewardOrg.name) {
                exports.addError(elt._id, 'classification steward org is missing');
                continue;
            }
            if (classificationBySteward[c.stewardOrg.name]) {
                exports.mergeClassification(classificationBySteward[c.stewardOrg.name], c);
                elt.classification.splice(i, 1);
                i--;
                changed = true;
                continue;
            }
            classificationBySteward[c.stewardOrg.name] = c;
        }
    }
    if (elt.createdBy) {
        if (!['undefined', 'object', 'string'].includes(typeof elt.createdBy.userId) || elt.createdBy.userId === null) {
            elt.createdBy.userId = undefined;
            changed = true;
        }
        if (typeof elt.createdBy.username !== 'string') {
            elt.createdBy.username = 'nobody';
            changed = true;
        }
    } else {
        elt.createdBy = {username: 'nobody'};
        changed = true;
    }
    if (elt.definitions) {
        for (let i = 0; i < elt.definitions.length; i++) {
            const definition = elt.definitions[i];
            if (!definition.definition) {
                elt.definitions.splice(i, 1);
                i--;
                changed = true;
            }
        }
    }
    const designations = exports.fixDesignations(elt.designations);
    if (designations) {
        elt.designations = designations;
        changed = true;
    }
    changed = exports.fixIds(elt.ids) || changed;
    if (elt.properties) {
        for (let i = 0; i < elt.properties.length; i++) {
            const property = elt.properties[i];
            if (!property || !property.key || !property.value) {
                elt.properties.splice(i, 1);
                i--;
                changed = true;
                continue;
            }
            if (!exports.isValueFormat(property.valueFormat)) {
                property.valueFormat = undefined;
                changed = true;
            }
        }
    }
    if (elt.sources) {
        for (let i = 0; i < elt.sources.length; i++) {
            const source = elt.sources[i];
            if (!source.sourceName) {
                elt.sources.splice(i, 1);
                i--;
                changed = true;
                continue;
            }
            if (typeof source.created !== 'undefined' && !source.created) {
                source.created = undefined;
                changed = true;
            }
            if (typeof source.imported !== 'undefined' && !source.imported) {
                source.imported = undefined;
                changed = true;
            }
            if (typeof source.updated !== 'undefined' && !source.updated) {
                source.updated = undefined;
                changed = true;
            }
        }
    }
    if (elt.updatedBy) {
        if (!['undefined', 'object', 'string'].includes(typeof elt.updatedBy.userId) || elt.updatedBy.userId === null) {
            elt.updatedBy.userId = undefined;
            changed = true;
        }
        if (!['undefined', 'string'].includes(typeof elt.updatedBy.username)) {
            elt.updatedBy.username = undefined;
            changed = true;
        }
    }

    return changed;
};

exports.fixDatatypeContainer = function fixDatatypeContainer(dc) {
    let changed = [];
    if (dc.datatype !== 'Date' && typeof dc.datatypeDate !== 'undefined') {
        dc.datatypeDate = undefined;
        changed.push('datatypeDate');
    }
    if (dc.datatype !== 'Dynamic Code List' && typeof dc.datatypeDynamicCodeList !== 'undefined') {
        dc.datatypeDynamicCodeList = undefined;
        changed.push('datatypeDynamicCodeList');
    }
    if (dc.datatype !== 'Externally Defined' && typeof dc.datatypeExternallyDefined !== 'undefined') {
        dc.datatypeExternallyDefined = undefined;
        changed.push('datatypeExternallyDefined');
    }
    if (dc.datatype !== 'Number' && typeof dc.datatypeNumber !== 'undefined') {
        dc.datatypeNumber = undefined;
        changed.push('datatypeNumber');
    }
    if ((dc.datatype === 'Date' || dc.datatype === 'Externally Defined' || dc.datatype === 'Number'
        || dc.datatype === 'Time' || dc.datatype === 'Value List') && typeof dc.datatypeText !== 'undefined') { // Text
        dc.datatypeText = undefined;
        changed.push('datatypeText');
    }
    if (dc.datatype !== 'Time' && typeof dc.datatypeTime !== 'undefined') {
        dc.datatypeTime = undefined;
        changed.push('datatypeTime');
    }
    if (dc.datatype !== 'Value List' && typeof dc.datatypeValueList !== 'undefined') {
        dc.datatypeValueList = undefined;
        changed.push('datatypeValueList');
    }
    if (!['undefined', 'object'].includes(typeof dc.datatypeDate) || dc.datatypeDate === null) {
        dc.datatypeDate = undefined;
        changed.push('datatypeDate');
    }
    if (!['undefined', 'object'].includes(typeof dc.datatypeExternallyDefined) || dc.datatypeExternallyDefined === null) {
        dc.datatypeExternallyDefined = undefined;
        changed.push('datatypeExternallyDefined');
    }
    if (!['undefined', 'object'].includes(typeof dc.datatypeNumber) || dc.datatypeNumber === null) {
        dc.datatypeNumber = undefined;
        changed.push('datatypeNumber');
    }
    if (!['undefined', 'object'].includes(typeof dc.datatypeText) || dc.datatypeText === null) {
        dc.datatypeText = undefined;
        changed.push('datatypeText');
    }
    if (!['undefined', 'object'].includes(typeof dc.datatypeTime) || dc.datatypeTime === null) {
        dc.datatypeTime = undefined;
        changed.push('datatypeTime');
    }
    if (!['undefined', 'object'].includes(typeof dc.datatypeValueList) || dc.datatypeValueList === null) {
        dc.datatypeValueList = undefined;
        changed.push('datatypeValueList');
    }
    if (dc.datatypeNumber) {
        if (!['undefined', 'number'].includes(typeof dc.datatypeNumber.minValue)) {
            dc.datatypeNumber.minValue = exports.stringToNumber(dc.datatypeNumber.minValue);
            changed.push('datatypeNumber.minValue');
        }
        if (!['undefined', 'number'].includes(typeof dc.datatypeNumber.maxValue)) {
            dc.datatypeNumber.maxValue = exports.stringToNumber(dc.datatypeNumber.maxValue);
            changed.push('datatypeNumber.maxValue');
        }
        if (!['undefined', 'number'].includes(typeof dc.datatypeNumber.precision)) {
            dc.datatypeNumber.precision = exports.stringToNumber(dc.datatypeNumber.precision);
            changed.push('datatypeNumber.precision');
        }
    }
    if (dc.datatypeText) {
        if (!['undefined', 'number'].includes(typeof dc.datatypeText.minLength)) {
            dc.datatypeText.minLength = exports.stringToNumber(dc.datatypeText.minLength);
            changed.push('datatypeText.minLength');
        }
        if (!['undefined', 'number'].includes(typeof dc.datatypeText.maxLength)) {
            dc.datatypeText.maxLength = exports.stringToNumber(dc.datatypeText.maxLength);
            changed.push('datatypeText.maxLength');
        }
        if (!['undefined', 'string'].includes(typeof dc.datatypeText.regex)) {
            dc.datatypeText.regex = undefined;
            changed.push('datatypeText.regex');
        }
        if (!['undefined', 'string'].includes(typeof dc.datatypeText.rule)) {
            dc.datatypeText.rule = undefined;
            changed.push('datatypeText.rule');
        }
        if (!['undefined', 'boolean'].includes(typeof dc.datatypeText.showAsTextArea)) {
            dc.datatypeText.showAsTextArea = undefined;
            changed.push('datatypeText.showAsTextArea');
        }
    }
    return changed;
};

exports.fixDesignations = function fixDesignations(designations, label = undefined) {
    if (!label) label = '(no label)';
    let changed = false;

    if (!designations) designations = [];
    for (let i = 0; i < designations.length; i++) {
        const designation = designations[i];
        if (!designation || typeof designation.designation !== 'string' || !designation.designation) {
            designations.splice(i, 1);
            i--;
            changed = true;
        }
    }
    if (designations.length === 0) {
        designations.push({designation: label});
        changed = true;
    }

    return changed ? designations : undefined;
};

exports.fixIds = function fixIds(ids) {
    let changed = false;

    if (ids) {
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (!id.source || !id.id) {
                ids.splice(i, 1);
                i--;
                changed = true;
            }
        }
    }

    return changed;
};

exports.fixPermissibleValues = function fixPermissibleValues(permissibleValues, datatype) {
    let changed = false;
    if (datatype === 'Value List') {
        const isDups = [exports.newIsDuplicateAndAdd(), exports.newIsDuplicateAndAdd(), exports.newIsDuplicateAndAdd()];
        const isDupsProperties = ['permissibleValue', 'valueMeaningCode', 'valueMeaningName'];
        if (typeof permissibleValues === 'undefined' || !Array.isArray(permissibleValues)) {
            permissibleValues = [];
            changed = true;
        }
        for (let i = 0; i < permissibleValues.length; i++) {
            const pv = permissibleValues[i];
            if (!pv.permissibleValue && !pv.valueMeaningCode && !pv.valueMeaningName) {
                permissibleValues.splice(i, 1);
                i--;
                changed = true;
                continue;
            }
            if (!pv.permissibleValue) {
                pv.permissibleValue = pv.valueMeaningName || pv.valueMeaningCode;
                changed = true;
            }
            const duplicates = isDups.map((isDup, i) => isDup(pv[isDupsProperties[i]]));
            const numberOfDuplicates = duplicates.reduce((a, b) => a + b);
            if (numberOfDuplicates === 3) {
                permissibleValues.splice(i, 1);
                i--;
                changed = true;
                continue;
            }
            if (numberOfDuplicates > 0 && numberOfDuplicates < 3) {
                duplicates.forEach((isDuplicate, i) => {
                    if (isDuplicate) {
                        pv[isDupsProperties[i]] = exports.newKeyAndAdd(pv[isDupsProperties[i]], isDups[i]);
                    }
                });
                changed = true;
            }
            if (pv.valueMeaningCode && !pv.codeSystemName) {
                pv.codeSystemName = '(no system)';
            }
        }
        if (permissibleValues.length === 0) {
            permissibleValues.push({permissibleValue: '0'});
        }
    } else {
        if (typeof permissibleValues !== 'undefined') {
            permissibleValues = undefined;
            changed = true;
        }
    }

    return changed ? permissibleValues : null;
};

exports.isValueFormat = function isValueFormat(valueFormat) {
    return typeof valueFormat === 'undefined' || valueFormat === 'html';
};

exports.mergeClassification = function mergeClassification(dest, src) {
    src.elements && src.elements.forEach(element => {
        const match = dest.elements.filter(e => e.name === element.name)[0];
        if (match) {
            mergeClassification(match, element);
        } else {
            dest.elements.push(element);
        }
    });
};

exports.newIsDuplicateAndAdd = function newIsDuplicateAndAdd() {
    const keys = new Set();
    return function isDuplicateAndAdd(key) {
        if (!key) {
            return false;
        }
        if (keys.has(key)) {
            return true;
        }
        keys.add(key);
        return false;
    };
};

exports.newKeyAndAdd = function newKeyAndAdd(key, isDuplicateAndAdd) {
    while (isDuplicateAndAdd(key)) {
        key += '-1';
    }
    return key;
};

exports.stringToNumber = function stringToNumber(str) {
    const num = typeof str === 'string' ? parseInt(str) : undefined;
    return Number.isNaN(num) ? undefined : num;
};

exports.verifyObjectId = function verifyObjectId(model, cb) {
    model.find({_id: {$not: {$type: 'objectId'}}}, {_id: true}).exec((err, idObjs) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        cb(idObjs.map(o => o._id.toString()));
    });
};

exports.addError = function addError(id, error) {
    exports.errors.push({id, error});
    console.log(id + ': ' + error);
};

exports.finished = function finished(err) {
    console.log(err[0] ? 'ERROR: ' + err[0] : 'Finished!');
    console.log('Document count: ' + exports.count);
    if (exports.cleanup) {
        console.log('Fixed count: ' + exports.fixed);
    }
    console.log('Validation Errors count: ' + exports.errors.length);
    // console.log('Validation Errors:');
    // errors.forEach(error => console.log(error.id + ': ' + error.error));
    process.exit(1);
};

exports.exitWithError = function exitWithError(err) {
    console.log('Not Finished! Exit with error: ' + err);
    process.exit(1);
};
