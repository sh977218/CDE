import { eachLimit } from 'async';
import { NindsModel } from 'ingester/createMigrationConnection';
import { createNindsCde } from 'ingester/ninds/website/cde/cde';
import { createNindsForm } from 'ingester/ninds/website/form/form';
import { loadNindsCde, loadNindsForm } from 'ingester/ninds/shared';
import { dataElementModel } from 'server/cde/mongo-cde';
import { BATCHLOADER, imported, updateCde, updateForm } from 'ingester/shared/utility';
import { formModel } from 'server/form/mongo-form';

function removeNindsClassification(elt: any) {
    elt.classification = elt.classification.filter((c: any) => c.stewardOrg.name !== 'NINDS');
}

async function loadNindsCdes() {
    const cdeIds = await NindsModel.distinct('cdes.CDE ID');
    await eachLimit(cdeIds, 200, async cdeId => {
        const nindsForms = await NindsModel.find({'cdes.CDE ID': cdeId},
            {
                _id: 0,
                diseaseName: 1,
                subDiseaseName: 1,
                domainName: 1,
                subDomainName: 1,
                cdes: {$elemMatch: {'CDE ID': cdeId}}
            }).lean();
        const cde = await createNindsCde(nindsForms);
        const cond = {
            archived: false,
            'ids.id': cdeId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        await loadNindsCde(cde, cond, 'NINDS');
    });
}

async function loadNindsForms() {
    const formIds = await NindsModel.distinct('formId', {'cdes.0': {$exists: true}});
    await eachLimit(formIds, 50, async formId => {
        const nindsForms = await NindsModel.find({formId}).lean();
        const nindsForm = await createNindsForm(nindsForms);
        const cond = {
            archived: false,
            'ids.id': formId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        await loadNindsForm(nindsForm, cond, 'NINDS');
    });
}

async function retireNindsCdes() {
    const cdesToRetire = await dataElementModel.find({
        archived: false,
        'classification.stewardOrg.name': 'NINDS',
        'classification.elements.name': {$ne: 'Preclinical TBI'},
        'registrationState.registrationStatus': {$ne: 'Retired'}
    });
    for (const cdeToRetire of cdesToRetire) {
        const cdeObj = cdeToRetire.toObject();
        if (cdeObj.classification < 2) {
            removeNindsClassification(cdeObj);
            cdeObj.registrationState.registrationStatus = 'Retired';
            cdeObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
            await updateCde(cdeObj, BATCHLOADER);
        }
    }
}

async function retireNindsForms() {
    const formsToRetire = await formModel.find({
        archived: false,
        'classification.stewardOrg.name': 'NINDS',
        'classification.elements.name': {$ne: 'Preclinical TBI'},
        'registrationState.registrationStatus': {$ne: 'Retired'}
    });
    for (const formToRetire of formsToRetire) {
        const formObj = formToRetire.toObject();
        if (formObj.classification < 2) {
            removeNindsClassification(formObj);
            formObj.registrationState.registrationStatus = 'Retired';
            formObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
            await updateForm(formObj, BATCHLOADER);
        }
    }
}

async function run() {
    await loadNindsCdes();
    await loadNindsForms();
    await retireNindsCdes();
    await retireNindsForms();
}

run().then(
    result => {
        console.log(result);
        console.log('Finished all ninds.');
        process.exit(0);
    },
    err => {
        console.log(err);
        process.exit(1);
    }
);
