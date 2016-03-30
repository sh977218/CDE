var config = require('../../modules/system/node-js/parseConfig'),
    mongoose = require('mongoose'),
    NindsModel = require('./createConnection').NindsModel,
    form_schemas = require('../../modules/form/node-js/schemas')
    ;


var mongoUri = config.mongoUri;

var conn = mongoose.createConnection(mongoUri);
conn.on('error', console.error.bind(console, 'appData connection error:'));
conn.on('error', function () {
    process.exit(1);
});
conn.once('open', function callback() {
    console.log('mongodb connection open');
});

var Form = conn.model('Form', form_schemas.formSchema);


var stream = Form.find({'stewardOrg.name': 'NINDS', archived: null}).stream();

function a() {
    stream.on('data', function (form) {
        stream.pause();
        var formId;
        var rds = form.get('referenceDocuments');
        var rd = rds[0];
        var uri = rd.uri;
        var formIdArray = uri.match('/F[0-9]{0,4}');
        if (formIdArray && formIdArray.length > 0) {
            formId = formIdArray[0].replace('/', '');
            var id = {
                id: formId,
                source: 'NINDS'
            };
            stream.resume();
        } else {
            var formNames = form.get('naming');
            var formName = formNames[0].designation;
            NindsModel.find({
                'crfModuleGuideline': formName,
                'downloadLink': uri
            }, function (err, existingForms) {
                if (err) throw err;
                if (existingForms.length === 0) {
                    console.log('cannot find form of formName: ' + formName);
                    console.log('form._id:' + form.get('_id'));
                    process.exit(1);
                } else if (existingForms.length === 1) {
                    formId = existingForms[0].get('formId');
                    var id = {
                        id: formId,
                        source: 'NINDS'
                    };
                    stream.resume();
                } else {
                    var sameId = existingForms[0].get('formId');
                    for (var i = 0; i < existingForms.length; i++) {
                        var f = existingForms[i];
                        if (sameId != f.get('formId')) {
                            console.log('found multiple different formId for form:' + formName);
                            console.log('form._id:' + form.get('_id'));
                            console.log('index: ' + i);
                            process.exit(1);
                        }
                    }
                    stream.resume();
                }
            })
        }
    });
}

a();