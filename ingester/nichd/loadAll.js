const fs = require('fs');
const parse = require('csv-parse/lib/sync');
let mongo_data = require('../../server/system/mongo-data');
const DataElement = require('../../server/cde/mongo-cde').DataElement;
const Form = require('../../server/form/mongo-form').Form;

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


const createCde = function(row, classification = "Core") {
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

    return cde;

};

let cdeSaved = 0;
let formSaved = 0;

async function loadCdes (done) {
    for (let row of allRows) {

        let cde = createCde(row);

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

        forms[row.Form].formElements[0].formElements.push({
            elementType: "question",
            label: cde.designations[0].designation,
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
        });


        await new DataElement(cde).save();
        cdeSaved++;
    }
    done();
}

loadCdes(async () => {
    for (let formName of Object.keys(forms)) {
        await new Form(forms[formName]).save();
        formSaved++;
    }

    console.log("DONE");
    console.log(formSaved + " forms created");
    console.log(cdeSaved + " CDEs created");

});

