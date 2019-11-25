import { remove, uniq } from 'lodash';
import { eachLimit } from 'async';
import { NindsModel } from 'ingester/createMigrationConnection';
import { createNindsCde } from 'ingester/ninds/website/cde/cde';
import { createNindsForm } from 'ingester/ninds/website/form/form';
import { loadNindsCde, loadNindsForm } from 'ingester/ninds/shared';
import { dataElementModel } from 'server/cde/mongo-cde';
import { BATCHLOADER, fixForm, lastMigrationScript, retiredElt, updateCde, updateForm } from 'ingester/shared/utility';
import { formModel } from 'server/form/mongo-form';

function removeNindsClassification(elt: any) {
    const nindsClassifications = elt.classification.filter((c: any) => c.stewardOrg.name === 'NINDS');
    const preclinicalElements = nindsClassifications[0].elements.filter((e: any) => e.name === 'Preclinical TBI');
    let otherClassification = elt.classification.filter((c: any) => c.stewardOrg.name !== 'NINDS');
    if (preclinicalElements.length) {
        otherClassification = [{
            stewardOrg: {name: 'NINDS'},
            elements: preclinicalElements
        }].concat(otherClassification);
    }
    elt.classification = otherClassification;
}

async function loadNindsCdes() {
    const cdeIds = await NindsModel.distinct('cdes.CDE ID');
    await eachLimit(cdeIds, 500, async cdeId => {
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

const sameFormIdsMap = {};

async function duplicateFormIds(formIds) {
    const duplicateFormIds = [];
    for (const formId of formIds) {
        const cond = {
            archived: false,
            'ids.id': formId,
            $where: 'this.ids.length > 1',
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        const forms = await formModel.find(cond);
        if (forms.length === 0) {
            // console.log(`form ${formId} has only 1 ninds id.`);
        } else if (forms.length !== 1) {
            // console.log(`Incorrect form length ${formId} found.`);
            process.exit(1);
        } else {
            const formObj = forms[0].toObject();
            const nindsIds = formObj.ids.filter(i => i.source === 'NINDS');
            sameFormIdsMap[nindsIds[0].id] = [];
            for (let i = 1; i < nindsIds.length; i++) {
                const id = nindsIds[i];
                sameFormIdsMap[nindsIds[0].id].push(id.id);
                duplicateFormIds.push(id.id);
            }
        }
    }
    const _duplicateFormIds = uniq(duplicateFormIds);
    remove(formIds, f => {
        const index = _duplicateFormIds.indexOf(f);
        if (index !== -1) {
            return true;
        } else {
            return false;
        }
    });
}

async function loadNindsForms() {
    const formIds = await NindsModel.distinct('formId', {'cdes.0': {$exists: true}});
    await duplicateFormIds(formIds);
//    await eachLimit(formIds, 1, async formId => {
    await eachLimit(['F0374'], 1, async formId => {
        const cond: any = {
            archived: false,
            'ids.id': formId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        const nindsForms = await NindsModel.find({
            formId: {$in: [formId].concat(sameFormIdsMap[formId])}
        }).lean();
        const nindsForm = await createNindsForm(nindsForms);
        await loadNindsForm(nindsForm, cond, 'NINDS');
    });
}

async function retireNindsCdes() {
    let retiredCdeCount = 0;
    await dataElementModel.find({
        archived: false,
        'classification.stewardOrg.name': 'NINDS',
        'registrationState.registrationStatus': {$ne: 'Retired'}
    }).cursor().eachAsync(async cdeToRetire => {
        const cdeObj = cdeToRetire.toObject();
        if (cdeObj.lastMigrationScript !== lastMigrationScript) {
            removeNindsClassification(cdeObj);
            if (cdeObj.classification.length < 1) {
                retiredElt(cdeObj);
                retiredCdeCount++;
                console.log(`retire Cde: ${cdeObj.tinyId}`);
            }
            await updateCde(cdeObj, BATCHLOADER);
            if (retiredCdeCount % 100 === 0) {
                console.log('retiredCdeCount: ' + retiredCdeCount);
            }

        }
    });
    console.log('retiredCdeCount: ' + retiredCdeCount);
}

async function retireNindsForms() {
    let retiredFormCount = 0;
    await formModel.find({
        archived: false,
        'classification.stewardOrg.name': 'NINDS',
        'registrationState.registrationStatus': {$ne: 'Retired'}
    }).cursor().eachAsync(async formToRetire => {
        const form = await fixForm(formToRetire).catch((err: any) => {
            console.log(`Not able to fix form when in retireNindsForms ${err}`);
            process.exit(1);
        });
        const formObj = form.toObject();
        if (formObj.lastMigrationScript !== lastMigrationScript) {
            removeNindsClassification(formObj);
            if (formObj.classification.length < 1) {
                retiredElt(formObj);
                retiredFormCount++;
                console.log(`retire Form: ${formObj.tinyId}`);
            }
            await updateForm(formObj, BATCHLOADER);
            if (retiredFormCount % 100 === 0) {
                console.log('retiredFormCount: ' + retiredFormCount);
            }
        }
    });
    console.log('retiredFormCount: ' + retiredFormCount);
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
