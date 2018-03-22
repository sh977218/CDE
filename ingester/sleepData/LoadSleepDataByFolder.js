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

let unmappedUnits = [];
let unmappedType = [];

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

function loadDomains(folder) {
    let allFiles = fs.readdirSync(folder);
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
    let allFiles = fs.readdirSync(folder);
    let variablesFile;
    for (let file of allFiles) {
        if (file.indexOf('variables.csv') > -1)
            variablesFile = folder + file;
    }
    return new Promise((resolve, reject) => {
        csv.parse(fs.readFileSync(variablesFile), CSV_COND, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
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
        let DOMAINS = await loadDomains(folder);
        let count = 0;
        let VARIABLES = await loadVariables(folder);
        let slc = new SleepDataConverter();
        for (let variable of VARIABLES) {
            let cde = slc.convert(variable, classification, DOMAINS);
            let existingCdes = await findCdeById(cde.ids[0].id);
            if (existingCdes.length === 0) {
                let newCde = await saveCde(cde);
                if (newCde) count++;
            } else if (existingCdes.length === 1) {
                let existingCde = existingCdes[0];
                let existingCdeObj;
                if (existingCde.toObject) existingCdeObj = existingCde.toObject();
                let isValueDomainEqual = _.isEqual(cde.valueDomain, existingCdeObj.valueDomain);
                let isNamingEqual = _.isEqual(cde.naming, existingCdeObj.naming);
                existingCde.properties = _.uniqBy(existingCde.properties.concat(cde.properties), 'key');
                if (isNamingEqual && isValueDomainEqual) resolve();
                else {
                    if (!isNamingEqual) existingCde.naming = cde.naming;
                    if (!isValueDomainEqual) existingCde.valueDomain = cde.valueDomain;
                    let newCde = await updateCde(existingCde);
                    if (newCde) count++;
                }
            } else reject('Existing Cdes ' + existingCdes.length + ': ' + cde.ids[0].id);
        }
        resolve(count);
    });
};

