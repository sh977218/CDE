import {BATCHLOADER} from 'ingester/shared/utility';

const async = require('async');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

process.env.NODE_CONFIG_DIR = path.resolve('../../../config');
const config = require('config');

const mongo_data = require('../../../server/system/mongo-data');

const DataElement = require('../../../server/mongo/mongoose/dataElement.mongoose').dataElementModel;
const FormModel = require('../../../server/mongo/mongoose/form.mongoose').formModel;

const dataElementStream = require('../../../server/mongo/mongoose/dataElement.mongoose').getStream;
const formStream = require('../../../server/mongo/mongoose/form.mongoose').getStream;

const {dataElementDb, formDb} = require('../../../server').dbPlugins;

let dir = path.resolve('raw');
fs.readdir(dir, (err, files) => {
    async.eachSeries(files.filter(f => f.match(/data_dict\.xml$/)), (f, cb) => {
        fs.readFile(path.resolve(dir, f), (err, xmlData) => {
            if (err) throw err;
            xml2js.parseString(xmlData, (err, data) => {
                if (err) cb(err);
                addForm(data.data_table, cb);
            });
        });
    }, (err) => {
        if (err)
            console.log('A file failed to process');
        else
            console.log('All files have been processed successfully');
        process.exit();
    });
});

function addForm(rootElem, cb) {
    let study = rootElem.$.study_id + (rootElem.$.participant_set ? '.p' + rootElem.$.participant_set : '');
    let dataSetId = (rootElem.$.id ? rootElem.$.id : rootElem.$.dataset_id);
    let dataSetName = rootElem.variable.reduce((acc, elem) => {
        let dataset = elem.name[0].substr(0, 4);
        let found = acc.reduce((fa, fv, fi) => {
            return (fv.id === dataset ? fi : fa)
        }, -1);
        if (found !== -1) {
            acc[found].cum++;
            return acc;
        } else
            return acc.concat({id: dataset, cum: 0});
    }, []).reduce((acc, val) => {
        if (val.cum > acc.cum)
            return val;
        return acc;
    }, {id: '', cum: 0}).id;

    let condition = {
        $and: [
            {"ids.id": dataSetName},
            {"ids.source": "dbGaP"}
        ]
    };
    formDb.count(condition).then(count => {
        if (count === 1) {
            let stream = formStream(condition);
            stream.on('data', function (form) {
                modifyForm(form, rootElem, dataSetName, cb);
            });
            return;
        }
        if (count > 1) throw "too many forms form data set: " + dataSetId;
        let form = new FormModel({
            classification: [{
                elements: [{
                    name: "NLM/dbGaP",
                }],
                stewardOrg: {
                    name: "NLM"
                }
            }],
            createdBy: BATCHLOADER,
            created: Date.parse(rootElem.$.date_created),
            formElements: [{
                elementType: "section",
                label: "",
                cardinality: "0.1",
                formElements: []
            }],
            imported: Date.now(),
            isCopyrighted: true,
            ids: [{
                id: dataSetName,
                source: "dbGaP"
            }],
            noRenderAllowed: false,
            properties: [{
                key: "dbGaP",
                value: rootElem.$.study_id + '.' + dataSetId
            }],
            registrationState: {
                registrationStatus: "Qualified"
            },
            sources: [{
                sourceName: "dbGaP"
            }],
            stewardOrg: {
                name: 'NLM'
            },
            tinyId: mongo_data.generateTinyId()
        });
        modifyForm(form, rootElem, dataSetName, cb);
    }, cb);
}

function modifyForm(form, rootElem, dataSetName, cb) {
    let study = rootElem.$.study_id + (rootElem.$.participant_set ? '.p' + rootElem.$.participant_set : '');
    let dataSetId = (rootElem.$.id ? rootElem.$.id : rootElem.$.dataset_id);
    let studyUrl = "https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/dataset.cgi?study_id=" + study + "&pht=" + dataSetId.substr(3, 6);
    let designation = (rootElem.description[0] ? rootElem.description[0] : dataSetName);

    if (form.naming.filter(d => {
        return d.designation === designation;
    }).length === 0)
        form.naming.push({
            designation: (rootElem.description[0] ? rootElem.description[0] : dataSetName),
            definition: ''
        });

    if (form.referenceDocuments.filter(r => {
        return r.uri === studyUrl;
    }).length === 0)
        form.referenceDocuments.push({
            uri: studyUrl,
            source: "dbGap"
        });

    async.eachSeries(rootElem.variable, (elem, cbCde) => {
        addCde(elem, form, study, cbCde);
    }, (err) => {
        if (err) throw err;
        form.save(function (err) {
            cb(err);
        });
    });
}

function addCde(elem, form, study, cb) {
    // not loaded description[1]
    let description = /\s*(?:(\w*)[:\.])?\s*(.+)\s*/.exec(elem.description[0]);

    let condition = {
        $and: [
            {"ids.id": elem.name[0]},
            {"ids.source": "dbGaP"}
        ]
    };
    dataElementDb.count(condition).then(count => {
        if (count === 1) {
            let stream = dataElementStream(condition);
            stream.on('data', function (cde) {
                modifyCde(cde, elem, form, study, description, cb);
            });
            return;
        }
        if (count > 1) throw "too many cdes form dbGaP code: " + study + '.' + elem.$.id;

        let cde = new DataElement({
            classification: [{
                elements: [{name: "NLM/dbGaP",}],
                stewardOrg: {name: "NLM"}
            }],
            dataSets: [],
            //domain
            ids: [{
                id: elem.name[0],
                source: "dbGaP"
            }],
            imported: new Date(),
            naming: [{
                designation: description[2],
                definition: '',
                languageCode: "EN-US",
                tags: [
                    {"tag": "Question Text"}
                ]
            }],
            properties: [{
                key: "dbGaP Study",
                value: study
            }],
            registrationState: {registrationStatus: "Qualified"},
            referenceDocuments: [],
            sources: [{sourceName: "dbGaP"}],
            stewardOrg: {name: "NLM"},
            tinyId: mongo_data.generateTinyId(),
            valueDomain: {
                datatype: (elem.type[0] === 'encoded' && elem.value && elem.value.length ? 'Value List' :
                    (elem.type[0] === 'number' || elem.type[0] === 'integer' ? 'Number' : 'Text'))
            },
            version: "1"
        });
        modifyCde(cde, elem, form, study, description, cb);
    }, cb);
}

function modifyCde(cde, elem, form, study, description, cb) {
    let studyUrl = "http://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/variable.cgi?study_id=" + study + "&phv=" + elem.$.id.substr(3, 8);
    if (cde.dataSets.filter(d => {
        return d.studyUri === studyUrl;
    }).length === 0)
        cde.dataSets.push({
            source: "dbGaP",
            id: study + '.' + elem.$.id,
            studyUri: studyUrl,
            dataUri: "ftp://ftp.ncbi.nlm.nih.gov/dbgap/studies/" + study.substring(0, study.indexOf('.'))
        });
    if (cde.referenceDocuments.filter(r => {
        return r.uri === studyUrl;
    }).length === 0)
        cde.referenceDocuments.push({
            uri: studyUrl,
            source: "dbGap"
        });

    if (elem.type[0] === 'encoded' && Array.isArray(elem.value)) {
        cde.valueDomain.datatype = 'Value List';
        elem.value.forEach(v => {
            let pv = {
                permissibleValue: (typeof (v) === "object" ? v.$.code : v),
                valueMeaningName: (typeof (v) === "object" ? v._ : v)
            };
            if (cde.valueDomain.permissibleValues.filter(p => {
                return p.permissibleValue === pv.permissibleValue;
            }).length === 0)
                cde.valueDomain.permissibleValues.push(pv);
        });
    }
    if (form.formElements[0].formElements.filter(f => {
        return (f.label === description[2] && f.question.cde.ids.filter(i => {
            return i.id === cde.ids[0].id;
        }).length !== 0);
    }).length === 0)
        form.formElements[0].formElements.push({
            elementType: "question",
            label: description[2],
            formElements: [],
            instructions: {value: elem.comment},
            question: {
                answers: JSON.parse(JSON.stringify(cde.valueDomain.permissibleValues)),
                cde: {
                    ids: cde.ids,
                    permissibleValues: JSON.parse(JSON.stringify(cde.valueDomain.permissibleValues)),
                    tinyId: cde.tinyId,
                    version: cde.version
                },
                datatype: cde.valueDomain.datatype,
                multiselect: false
            }
        });

    cde.save(function (err) {
        if (err) throw err;
        cb();
    });
}
