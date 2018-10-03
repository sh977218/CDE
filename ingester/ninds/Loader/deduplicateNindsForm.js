const _ = require('lodash');
const MigrationNindsModel = require('../../createMigrationConnection').MigrationNindsModel;
const NindsFormModel = require('../../createMigrationConnection').NindsFormModel;

let totalForm = 0;

function validate(form) {
    let requireArray = [
        'description',
        'copyright',
        'downloadLink',
        'formId',
        'versionNum',
        'versionDate',
    ];
    for (let p in form) {
        let value = form[p];
        if (Array.isArray(value)) {
            if (requireArray.indexOf(p) > -1 && value.length > 1) {
                console.log(form.formId + ' ' + p + ' length is not 1');
                process.exit(1);
            }
        } else {
            console.log(form.formId + ' ' + p + ' is not array');
            process.exit(1);
        }
    }
}

function doOneFormId(formId) {
    return new Promise(async (resolve, reject) => {
        let nindsForms = await MigrationNindsModel.find({'formId': formId}).lean();
        let form = {
            crfModuleGuideline: [],
            description: [],
            copyright: [],
            downloadLink: [],
            formId: [],
            cdes: [],
            versionNum: [],
            versionDate: [],
            classification: [],
            createDate: []
        };
        let keys = [
            'crfModuleGuideline',
            'description',
            'copyright',
            'downloadLink',
            'versionNum',
            'versionDate',
            'createDate'
        ];
        for (let nindsForm of nindsForms) {
            let classification = {
                disease: nindsForm.diseaseName.replace('Sport-Related Concussion', 'Sport Related Concussion'),
                subDisease: nindsForm.subDiseaseName,
                domain: nindsForm.domainName,
                subDomain: nindsForm.subDomainName
            };
            let classificationIndex = _.findIndex(form.classification, o => _.isEqual(o, classification));
            if (classificationIndex === -1) form.classification.push(classification);

            let formId = nindsForm.formId.replace('CRF-', '');

            let formIdIndex = _.findIndex(form.formId, o => _.isEqual(o, formId));
            if (formIdIndex === -1) form.formId.push(formId);


            for (let key of keys) {
                let value = nindsForm[key];
                if (value && form[key].indexOf(value) === -1)
                    form[key].push(value);
            }
            if (nindsForm.cdes.length > 0) {
                if (form.cdes.length === 0) {
                    form.cdes = nindsForm.cdes;
                } else if (form.cdes.length !== nindsForm.cdes.length) {
                    console.log(formId + ' cdes length not match');
                    process.exit(1);
                }
            }
        }
        validate(form);
        resolve(form);
    })
}

function run() {
    return new Promise(async (resolve, reject) => {
        await NindsFormModel.remove({});
        console.log('Migration Data Element removed.');
        let formIdList = await MigrationNindsModel.distinct('formId');
        console.log('total form: ' + formIdList.length);
        for (let formId of formIdList) {
            let form = await doOneFormId(formId);
            await new NindsFormModel(form).save();
            totalForm++;
        }
        resolve();
    })
}

run().then(() => {
    console.log(totalForm + ' forms finished');
    process.exit(1);
});

setInterval(function () {
    console.log('totalForm: ' + totalForm);
}, 5000);