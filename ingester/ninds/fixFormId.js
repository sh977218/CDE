var mongoose = require('mongoose');
var config = require('../../modules/system/node-js/parseConfig');
var NindsModel = require('../createMigrationConnection').MigrationNindsModel;
var Form = require('../../modules/form/node-js/mongo-form').Form;


function run() {
    var stream = Form.find({'stewardOrg.name': 'NINDS', archived: false}).stream();
    var i = 0;
    stream.on('data', function (form) {
        stream.pause();
        var formName = form.naming[0].designation;
        var uri = form.referenceDocuments[0].uri;
        var formIdArray = uri.match('/F[0-9]{0,4}');
        if (formIdArray && formIdArray.length > 0) {
            form.ids.push({
                id: formIdArray[0].replace('/', ''),
                source: 'NINDS'
            });
            i++;
            form.save(function (err) {
                if (err) throw err;
                stream.resume();
            });
        } else if (formName === 'Craig Handicap and Assessment Reporting Technique (CHART-SF) - Paper version') {
            form.ids.push({
                id: 'F1811',
                source: 'NINDS'
            });
            i++;
            form.save(function (err) {
                if (err) throw err;
                console.log(i + '\n-----------------------------------');
                console.log('Manually assign id F1811 to this form ' + formName);
                console.log('-----------------------------------\n');
                stream.resume();
            });
        } else {
            NindsModel.find({
                'crfModuleGuideline': formName
            }, function (err, existingForms) {
                if (err) throw err;
                if (existingForms.length === 0) {
                    console.log('Cannot find form of formName: ' + formName);
                    console.log('DownloadLink: ' + uri);
                    console.log('Form._id: ' + form.get('_id'));
                    process.exit(1);
                } else if (existingForms.length === 1) {
                    form.ids.push({
                        id: existingForms[0].get('formId'),
                        source: 'NINDS'
                    });
                    form.save(function (err) {
                        if (err) throw err;
                        i++;
                        stream.resume();
                    });
                } else {
                    form.ids.push({
                        id: existingForms[0].get('formId'),
                        source: 'NINDS'
                    });
                    form.save(function (err) {
                        if (err) throw err;
                        console.log(i + '\n-----------------------------------');
                        console.log('Multiple ids found for form name: ' + formName);
                        console.log('Only put the first id into ids.id: ' + existingForms[0].get('formId'));
                        console.log('Other ids are: ');
                        for (var j = 1; j < existingForms.length; j++) {
                            if (existingForms[0].get('formId') !== existingForms[j].get('formId'))
                                console.log('Different Id: ' + existingForms[j].get('formId'));
                            else
                                console.log(existingForms[j].get('formId'));
                        }
                        console.log('-----------------------------------\n');
                        i++;
                        stream.resume();
                    });
                }
            })
        }
    });

    stream.on('end', function () {
        console.log(i + ' forms id found');
        process.exit(1);
    })
}

run();