const fs = require('fs');
const util = require('util');
const async = require('async');
const _ = require('lodash');
const csv = require('csv');

let log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
let log_stdout = process.stdout;

console.log = function (d) {
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

function LoadCSV(filePath) {
    let cond = {
        columns: true,
        rtrim: true,
        trim: true,
        relax_column_count: true,
        skip_empty_lines: true,
        skip_lines_with_empty_values: true
    };
    return new Promise((resolve, reject) => {
        csv.parse(fs.readFileSync(filePath), cond, function (err, rows) {
            if (err) reject(err);
            else resolve(rows);
        });
    })
}

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

async function LoadSleepData(folderPath) {
    let files = fs.readdirSync(folderPath);
    let result = {};
    for (let file of files) {
        let rows = await LoadCSV(folderPath + file);
        if (file.indexOf('domains.csv') > -1)
            result['domains'] = mapDomains(rows);
        else if (file.indexOf('variables.csv') > -1) {
            result['variables'] = rows;
        } else throw new Error("Unknown CSV file found: " + file);
    }
    return result;
}

function convertSleepDataToCde(sleep, domains) {
    let cde = {
        naming: [{
            designation: sleep.display_name,
            definition: sleep.description,
            tags: [sleep.labels]
        }],
        ids: [{id: sleep.id}],
        valueDomain: {datatype: 'Text'}
    };
    if (sleep.type === 'choices') {
        cde.valueDomain.datatype = 'Value List';
        if (sleep['domain']) {
            cde.valueDomain.permissibleValues = domains[sleep['domain']];
        }
    }

    return cde;
}

LoadSleepData('S:/MLB/CDE/SleepData/1/').then(r => {
    let domains = r.domains;
    let variables = r.variables;
    variables.forEach(variable => {
        let cde = convertSleepDataToCde(variable, domains);
        console.log('a');
    });
}).catch(err => {
    console.log(err);
});
