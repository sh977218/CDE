import { NINDS_PRECLINICAL_NEI_FILE_PATH } from 'ingester/shared/utility';

const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const csv = require('csv');

const SleepDataConverter = require('./SleepDataConverter').SleepDataConverter;
const DataElement = require('../../server/cde/mongo-cde').DataElement;

let log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
let log_stdout = process.stdout;

console.log = function (d) {
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

const CSV_COND = {
    columns: true,
    rtrim: true,
    trim: true,
    relax_column_count: true,
    skip_empty_lines: true,
    skip_lines_with_empty_values: true
};

function mapDomains(rows) {
    let map = _.groupBy(rows, 'domain_id');
    Object.keys(map).forEach(key => {
        map[key] = map[key].map(v => {
            return {
                permissibleValue: v.value,
                valueMeaningName: v.display_name,
                valueMeaningDefinition: v.description
            }
        });
    });
    return map;
}

function mapVariables(rows) {
    let map = _.groupBy(rows, 'id');
    Object.keys(map).forEach(key => {
        if (map[key].length !== 1) throw new Error(key + " length is not 1.");
        else map[key] = map[key][0];
    });

    return map;
}


function mapMappings(rows) {
    let map = _.groupBy(rows, 'id');
    Object.keys(map).forEach(key => {
        let temp = map[key];
        Object.keys(temp[0]).forEach(k => {
            let target = temp[0][k];
            temp[0][k] = [target];
        });
        if (temp.length > 1) {
            for (let i = 1; i < temp.length; i++) {
                Object.keys(temp[0]).forEach(k => {
                    let target = temp[0][k];
                    let source = temp[i][k];
                    temp[0][k] = _.uniq(target.concat([source]));
                });
            }
        }
        map[key] = _.clone(temp[0]);
    });
    return map;
}

function loadDomains(folder) {
    let allFiles = fs.readdirSync(folder, 'utf8');
    let domainsFile;
    for (let file of allFiles) {
        if (file.indexOf('domains.csv') > -1)
            domainsFile = folder + file;
    }
    return new Promise((resolve, reject) => {
        csv.parse(fs.readFileSync(domainsFile), CSV_COND, (err, rows) => {
            if (err) reject(err);
            else resolve(mapDomains(rows));
        })
    });
}

function loadVariables(folder) {
    let allFiles = fs.readdirSync(folder, 'utf8');
    let variablesFile;
    for (let file of allFiles) {
        if (file.indexOf('variables.csv') > -1)
            variablesFile = folder + file;
    }
    return new Promise((resolve, reject) => {
        csv.parse(fs.readFileSync(variablesFile), CSV_COND, (err, rows) => {
            if (err) reject(err);
            else resolve(mapVariables(rows));
        })
    });
}

function loadMappings(folder) {
    let allFiles = fs.readdirSync(folder, 'utf8');
    let mappingsFile;
    for (let file of allFiles) {
        if (file.indexOf('mappings.csv') > -1)
            mappingsFile = folder + file;
    }
    return new Promise((resolve, reject) => {
        csv.parse(fs.readFileSync(mappingsFile), CSV_COND, (err, rows) => {
            if (err) reject(err);
            else resolve(mapMappings(rows));
        })
    });
}

function findCdeById(id) {
    let cond = {archived: false, 'ids.id': id};
    return new Promise((resolve, reject) => {
        DataElement.find(cond, (err, existingCdes) => {
            if (err) reject(err);
            else resolve(existingCdes);
        })
    });
}

function saveCde(cde) {
    return new Promise((resolve, reject) => {
        new DataElement(cde).save((err, newCde) => {
            if (err) reject(err);
            else resolve(newCde);
        });
    });
}

function updateCde(cde) {
    return new Promise((resolve, reject) => {
        cde.save((err, newCde) => {
            if (err) reject(err);
            else resolve(newCde);
        });
    });
}

exports.run = function runner(PATH, FOLDER) {
    let folder = PATH + FOLDER + '/';
    let classification = FOLDER.replace('&ReplaceWithForwardSlash&', '/');
    return new Promise(async (resolve, reject) => {
        let count = 0;
        let DOMAINS = await loadDomains(folder);
        let VARIABLES = await loadVariables(folder);
        let MAPPINGS = await loadMappings(folder);
        let slc = new SleepDataConverter();
        for (let mapping in MAPPINGS) {
            if (MAPPINGS.hasOwnProperty(mapping)) {
                let cde = slc.convert(MAPPINGS[mapping], classification, VARIABLES, DOMAINS);
                if (cde.ids.length === 0 || !cde.ids[0].id) {
                    console.log('skip');
                } else {
                    let existingCdes = await findCdeById(cde.ids[0].id);
                    if (existingCdes.length === 0) {
                        let newCde = await saveCde(cde);
                        if (newCde) {
                            count++;
                            console.log('count: ' + count);
                        }
                    } else if (existingCdes.length === 1) {
                        let existingCde = existingCdes[0];
                        let existingCdeObj;
                        if (existingCde.toObject) existingCdeObj = existingCde.toObject();
                        let isDataTypeEqual = _.isEqual(cde.valueDomain.datatype, existingCdeObj.valueDomain.datatype);
                        let isPVsEqual = _.isEqual(cde.valueDomain.permissibleValue, existingCdeObj.valueDomain.permissibleValue);
                        let isValueDomainEqual = isDataTypeEqual && isPVsEqual;
                        let isDesignationsEqual = _.isEqual(cde.designations, existingCdeObj.designations);
                        let isDefinitionsEqual = _.isEqual(cde.definitions, existingCdeObj.definitions);
                        existingCde.properties = _.uniqBy(existingCde.properties.concat(cde.properties), 'key');
                        existingCde.classification.elements = _.uniqBy(existingCde.classification[0].elements.concat(cde.classification[0].elements), 'name');
                        existingCde.markModified('classification');
                        if (isDesignationsEqual && isDefinitionsEqual && isValueDomainEqual) resolve();
                        else {
                            if (!isDesignationsEqual) existingCde.designations = _.uniqWith(existingCde.designations.concat(cde.designations), (a, b) => {
                                return a.designation === b.designation;
                            });
                            if (!isDefinitionsEqual) existingCde.definitions = _.uniqWith(existingCde.definitions.concat(cde.definitions), (a, b) => {
                                return a.definition === b.definition;
                            });
                            if (!isValueDomainEqual) {
                                console.log('folder: ' + folder + ' mapping: ' + mapping.display_name);
                                throw new Error('CDEs have different value domain.');
                                existingCde.valueDomain = cde.valueDomain;
                            }
                            await updateCde(existingCde);
                        }
                    } else reject('Existing Cdes ' + existingCdes.length + ': ' + cde.ids[0].id);
                }
            } else reject('Not own property.');
        }
        resolve(count);
    });
};

