const async = require('async');
const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const MigrationDataElementModel = require('../../createMigrationConnection').MigrationDataElementModel;
const MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;
const orgMapping = require('../Mapping/ORG_INFO_MAP').map;
const CreateCDE = require('../CDE/CreateCDE');

const orgName = 'External Forms';
let cdeCount = 0;

async function run() {
    let orgInfo = orgMapping[orgName];

    await MigrationDataElementModel.remove({}).catch(e => {
        throw e;
    });
    console.log('Removed all migration dataelement');

    await MigrationOrgModel.remove({}).catch(e => {
        throw e
    });
    console.log('Removed all migration org');

    let org = await new MigrationOrgModel({
        name: orgInfo['classificationOrgName'],
        classifications: []
    }).save().catch(e => {
        throw e
    });
    console.log('Created migration org of ' + orgInfo['classificationOrgName']);

    let cdeCond = {compoundForm: null, orgName: orgName};
    let migrationCdes = await MigrationLoincModel.find(cdeCond).catch(e => {
        throw e;
    });
    let loincIdArray = migrationCdes.map(c => c.get('loincId'));
    console.log('Total # Cde: ' + loincIdArray.length);

    loincIdArray.forEach(async loincId => {
        let loinc = await MigrationLoincModel.findOne({loincId: loincId}).catch(e => {
            throw e
        });
        if (!loinc) throw "LoincId " + loincId + " not found.";
        let loincObj = loinc.toObject();
        let newCde = await CreateCDE.createCde(loincObj, orgInfo);
        await ParseClassification.parseClassification(loinc, newCde, org, orgInfo['classificationOrgName'], orgInfo['classification']);

        console.log('a');
    })

    /*
        LoadLoincCdeIntoMigration.runArray(loincIdArray, org, orgInfo, function (one, next) {
            MigrationDataElementModel.find({'ids.id': one.ids[0].id}, (error, existingCdes) => {
                if (error) throw error;
                if (existingCdes.length === 0) {
                    one.classification = [{
                        elements: [{
                            name: "PHQ9",
                            elements: []
                        }],
                        stewardOrg: {
                            name: "NLM"
                        }
                    }
                    ];
                    new MigrationDataElementModel(one).save(function (e) {
                        if (e) throw e;
                        cdeCount++;
                        console.log('cdeCount: ' + cdeCount);
                        next();
                    })
                } else {
                    next();
                }
            });
        }, function (results) {
            org.save(function (err) {
                if (err) throw err;
                process.exit(1);
            })
        })
    */
}

run().then().catch(e => {
    throw e
});