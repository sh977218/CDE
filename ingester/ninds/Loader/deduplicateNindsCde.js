const _ = require('lodash');
const MigrationNindsModel = require('../../createMigrationConnection').MigrationNindsModel;
const NindsCdeModel = require('../../createMigrationConnection').NindsCdeModel;

const CreateCDE = require('../CDE/CreateCDE');

const newLine = '<br>';

let totalCDE = 0;

function validate(cde) {
    let requireArray = [
        'cdeId',
        'cdeName',
        'variableName',
        'definitionDescription',
        'dataType',
        'versionNum',
        'versionDate'
    ];
    let sizeOneOrZeroArray = [
        'measurementType'
    ];
    let optionalArray = [
        'aliasesForVariableName',
        'copyright',
        'previousTitle',
        'size',
        'minValue',
        'maxValue',
        'loincId',
        'snomed',
        'cadsrId',
        'cdiscId',
        'permissibleValue',
        'permissibleDescription',
        'inputRestrictions'
    ];
    for (let p in cde) {
        let value = cde[p];
        if (Array.isArray(value)) {
            if (requireArray.indexOf(p) > -1 && value.length !== 1) {
                console.log(cde.cdeId + ' ' + p + ' length is not 1');
                process.exit(1);
            }
            if (sizeOneOrZeroArray.indexOf(p) > -1 && value.length > 1) {
                console.log(cde.cdeId + ' ' + p + ' length is greater 1');
                process.exit(1);
            }

        } else {
            console.log(cde.cdeId + ' ' + p + ' is not array');
            process.exit(1);
        }
    }
}

function doOneCdeId(cdeId) {
    return new Promise(async (resolve, reject) => {
        let nindsCdes = await MigrationNindsModel.find({'cdes.cdeId': cdeId}, {
            diseaseName: 1,
            subDiseaseName: 1,
            formId: 1,
            cdes: {$elemMatch: {cdeId: cdeId}}
        }).lean();
        let cde = {
            cdeId: [],
            cdeName: [],
            variableName: [],
            definitionDescription: [],
            questionText: [],
            permissibleValues: [],
            dataType: [],
            instruction: [],
            reference: [],
            population: [],
            classification: [],
            versionNum: [],
            versionDate: [],
            aliasesForVariableName: [],
            crfModuleGuideline: [],
            copyright: [],
            previousTitle: [],
            size: [],
            inputRestrictions: [],
            minValue: [],
            maxValue: [],
            measurementType: [],
            loincId: [],
            snomed: [],
            cadsrId: [],
            cdiscId: []
        };
        let keys = [
            'cdeId',
            'cdeName',
            'variableName',
            'definitionDescription',
            'questionText',
            'dataType',
            'reference',
            'versionNum',
            'versionDate',
            'aliasesForVariableName',
            'crfModuleGuideline',
            'copyright',
            'previousTitle',
            'size',
            'inputRestrictions',
            'minValue',
            'maxValue',
            'measurementType',
            'loincId',
            'snomed',
            'cadsrId',
            'cdiscId'];
        for (let nindsCde of nindsCdes) {
            let classification = {
                disease: nindsCde.diseaseName.replace('Sport-Related Concussion', 'Sport Related Concussion'),
                subDisease: nindsCde.subDiseaseName,
                classification: nindsCde.cdes[0].classification,
                domain: nindsCde.cdes[0].domain,
                subDomain: nindsCde.cdes[0].subDomain
            };
            let classificationIndex = _.findIndex(cde.classification, o => _.isEqual(o, classification));
            if (classificationIndex === -1) cde.classification.push(classification);

            let formIdText = nindsCde.formId.replace('CRF-', '').trim();
            let instruction = formIdText + newLine + nindsCde.cdes[0].instruction + newLine;
            let instructionIndex = _.findIndex(cde.instruction, o => _.isEqual(o, instruction));
            if (instructionIndex === -1) cde.instruction.push(instruction);

            let pvs = CreateCDE.parsePermissibleValues(nindsCde.cdes[0]);
            cde.permissibleValues = _.uniqWith(cde.permissibleValues.concat(pvs), _.isEqual);

            nindsCde.cdes[0].population.split(';').forEach(population => {
                let populationIndex = _.findIndex(cde.population, o => _.isEqual(o, population));
                if (populationIndex === -1) cde.population.push(population);
            });

            for (let key of keys) {
                let value = nindsCde.cdes[0][key];
                if (value && cde[key].indexOf(value) === -1)
                    cde[key].push(value);
            }
        }

        validate(cde);
        resolve(cde);
    })
}

function run() {
    return new Promise(async (resolve, reject) => {
        await NindsCdeModel.remove({});
        console.log('Migration Data Element removed.');
        let cdeIdList = await MigrationNindsModel.distinct('cdes.cdeId');
        console.log('total CDE: ' + cdeIdList.length);
        for (let cdeId of cdeIdList) {
            let cde = await doOneCdeId(cdeId);
            await new NindsCdeModel(cde).save();
            totalCDE++;
        }
        resolve();
    })
}

run().then(() => {
    console.log('totalCDE: ' + totalCDE);
    process.exit(1);
});

setInterval(function () {
    console.log('totalCDE: ' + totalCDE);
}, 5000);