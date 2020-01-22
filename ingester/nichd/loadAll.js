import { BATCHLOADER } from 'ingester/shared/utility';

const fs = require('fs');
const parse = require('csv-parse/lib/sync');
let mongo_data = require('../../server/system/mongo-data');
let mongo_cde = require('../../server/cde/mongo-cde');
let mongo_form = require('../../server/form/mongo-form');
const _ = require('lodash');

// mdbrest --gzip --db test --collection dataelements --drop ~/Downloads/mongodump-20190118/nlmcde/dataelements.bson.gz
// mdbrest --gzip --db test --collection forms --drop ~/Downloads/mongodump-20190118/nlmcde/forms.bson.gz
// mdbrest --gzip --db test --collection orgs --drop ~/Downloads/mongodump-20190118/nlmcde/orgs.bson.gz


const inputFile = 'S:/MLB/CDE/NICHD/CoreCDE_03172016.csv';
const CSV_COND = {
    columns: true,
    rtrim: true,
    trim: true,
    relax_column_count: true,
    skip_empty_lines: true,
    skip_lines_with_empty_values: true
};

let allRows = parse(fs.readFileSync(inputFile), CSV_COND);

let forms = {};

let cdeSaved = 0;
let formSaved = 0;
let cdeUpdated = 0;

const updateCde = async function (row, classification = "Core") {
    let existingCde = await mongo_cde.byTinyId(row.NLM_ID);

    let foundClassif = existingCde.classification.find(c => c.stewardOrg === 'NICHD');
    if (!foundClassif) {
        existingCde.classification.push({
            stewardOrg: {
                name: 'NICHD',
            },
            elements: [{name: classification, elements: []}]
        });
    }

    let foundDesignation = existingCde.designations.find(d => d.designation === row.Question);
    if (foundDesignation) {
        foundDesignation.tags = _.union(foundDesignation.tags, ["Question Text"]);
    } else {
        existingCde.designations.push({designation: row.Question, tags: ["Question Text"], sources: ["NICHD"]});
    }

    if (row['Question Definition']) {
        let foundDefinition = existingCde.definitions.find(d => d.definition === row["Question Definition"]);
        if (!foundDefinition) {
            existingCde.definitions.push({definition: row['Question Definition'], tags: [], sources: ["NICHD"]});
        }
    }

    cdeUpdated++;
    await updateCde(existingCde, BATCHLOADER);
    return existingCde;
};

const createCde = function (row, classification = "Core") {
    let cde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: 'NICHD'},
        registrationState: {registrationStatus: 'Qualified'},
        designations: [{designation: row.Question, tags: ["Question Text"]}],
        definitions: [{definition: row['Question Definition'] || "No definition", tags: []}],
        ids: [],
        properties: [],
        valueDomain: {
            uom: '',
            datatype: 'Text',
            permissibleValues: []
        },
        classification: [{
            stewardOrg: {
                name: 'NICHD',
            },
            elements: [{name: classification, elements: []}]
        }],
        dataSets: []
    };

    let type = row['Question Type'];
    if (type === 'radio' || type === 'dropdown' || type === 'checkbox') {
        cde.valueDomain.datatype = 'Value List';
        row['Answer Choices'].split("|").forEach(answer => {
            if (answer.trim().length) {
                let value = answer.substr(0, answer.indexOf(",")).trim();
                let name = answer.substr(answer.indexOf(",") + 1).trim();
                cde.valueDomain.permissibleValues.push({
                    permissibleValue: value,
                    valueMeaningName: name
                });
            }
        })
    } else if (type === 'text' || type === 'notes') {
        cde.valueDomain.datatype = 'Text';
    } else console.log('unmapped type: ' + type);

    cdeSaved++;
    return new Promise(resolve => {
        mongo_cde.create(cde, BATCHLOADER, (err, newElt) => resolve(newElt));
    });
};

async function loadCdes(done) {
    for (let row of allRows) {

        let cde = row.NLM_ID ? await updateCde(row) : await createCde(row);

        console.log("tinyId: " + cde.tinyId);

        if (!forms[row.Form]) {
            forms[row.Form] = {
                tinyId: mongo_data.generateTinyId(),
                stewardOrg: {name: 'NICHD'},
                registrationState: {registrationStatus: 'Qualified'},
                designations: [{designation: row.Form, tags: ["Question Text"]}],
                definitions: [],
                ids: [],
                properties: [],
                classification: [{
                    stewardOrg: {
                        name: 'NICHD',
                    },
                    elements: [{name: "Core", elements: []}]
                }],
                formElements: [{
                    elementType: "section",
                    formElements: []
                }]
            };
        }

        let multiselect = row['Question Type'] === 'checkbox';

        let question = {
            elementType: "question",
            label: row.Question,
            question: {
                datatype: cde.valueDomain.datatype,
                multiselect: multiselect,
                cde: {
                    permissibleValues: cde.valueDomain.permissibleValues,
                    name: cde.designations[0].designation,
                    tinyId: cde.tinyId
                },
                answers: cde.valueDomain.permissibleValues
            }
        };

        if (row['Question Type'] === 'notes') question.question.datatypeText = {showAsTextArea: true};

        forms[row.Form].formElements[0].formElements.push(question);
    }
    done();
}

loadCdes(async () => {
    for (let formName of Object.keys(forms)) {
        await new Promise(resolve => mongo_form.create(forms[formName], BATCHLOADER, resolve));
        formSaved++;
    }

    console.log("DONE");
    console.log(formSaved + " forms created");
    console.log(cdeSaved + " CDEs created");
    console.log(cdeUpdated + " CDEs updated");

    process.exit();
});

