import { remove, uniq } from 'lodash';
import { eachLimit } from 'async';
import { NindsModel } from 'ingester/createMigrationConnection';
import { createNindsCde } from 'ingester/ninds/website/cde/cde';
import { createNindsForm } from 'ingester/ninds/website/form/form';
import { doNindsClassification, loadNindsCde, loadNindsForm } from 'ingester/ninds/shared';
import { dataElementModel } from 'server/cde/mongo-cde';
import {
    BATCHLOADER, findOneCde, imported, lastMigrationScript, retiredElt, updateCde, updateForm,
    updateRawArtifact
} from 'ingester/shared/utility';
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

function loadNindsCdes() {
    const phq9CdeIds = ['C07430', 'C07431', 'C07432', 'C07433', 'C07435', 'C07436', 'C07437', 'C07438', 'C07439', 'C07440', 'C07441'];

    return new Promise(async (resolve, reject) => {
        const cdeIds = await NindsModel.distinct('cdes.CDE ID');
//        const cdeIds = phq9CdeIds;
        eachLimit(cdeIds, 500, async cdeId => {
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
            const isPhq9 = phq9CdeIds.indexOf(cdeId) !== -1;
            if (isPhq9) {
                const newCde = new dataElementModel(cde);
                const newCdeObj = newCde.toObject();
                const existingCdes: any[] = await dataElementModel.find(cond);
                const existingCde: any = findOneCde(existingCdes);
                const existingCdeObj = existingCde.toObject();
                doNindsClassification(existingCdeObj, newCde.toObject());
                existingCde.classification = existingCdeObj.classification;
                existingCde.lastMigrationScript = lastMigrationScript;
                existingCde.imported = imported;
                await existingCde.save();
                await updateRawArtifact(existingCde, newCdeObj, 'NINDS', 'NINDS');
            } else {
                await loadNindsCde(cde, cond, 'NINDS');
            }
        }, err => {
            if (err) {
                reject(err);
            } else {
                console.log('Finished loadNindsCdes().');
                resolve();
            }
        });
    });
}

const sameFormIdsMap: any = {};

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
    remove(formIds, f => _duplicateFormIds.indexOf(f) !== -1);
}

function loadNindsForms() {
    return new Promise(async (resolve, reject) => {
        const formIds = await NindsModel.distinct('formId', {'cdes.0': {$exists: true}});
        await duplicateFormIds(formIds);
        eachLimit(formIds, 1, async formId => {
            const cond: any = {
                archived: false,
                'ids.id': formId,
                'registrationState.registrationStatus': {$ne: 'Retired'}
            };
            // @ts-ignore
            const sameFormIds = sameFormIdsMap[formId];
            const nindsForms = await NindsModel.find({
                formId: {$in: [formId].concat(sameFormIds)}
            }).lean();
            const nindsForm = await createNindsForm(nindsForms);
            await loadNindsForm(nindsForm, cond, 'NINDS');
        }, err => {
            if (err) {
                reject(err);
            } else {
                console.log('Finished loadNindsForms().');
                resolve();
            }
        });
    });
}

function retireNindsCdes() {
    return new Promise(async (resolve, reject) => {
        let retiredCdeCount = 0;
        dataElementModel.find({
            archived: false,
            'classification.stewardOrg.name': 'NINDS',
            'registrationState.registrationStatus': {$ne: 'Retired'}
        }).cursor({batchSize: 10}).eachAsync(async cdeToRetire => {
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
        }).then(() => {
            console.log('retiredCdeCount: ' + retiredCdeCount);
            console.log('Finished retireNindsCdes().');
            resolve();
        }, err => {
            reject(err);
        });
    });
}

function retireNindsForms() {
    return new Promise(async (resolve, reject) => {
        let retiredFormCount = 0;
        formModel.find({
            archived: false,
            'classification.stewardOrg.name': 'NINDS',
            'registrationState.registrationStatus': {$ne: 'Retired'}
        }).cursor({batchSize: 10}).eachAsync(async formToRetire => {
            const formObj = formToRetire.toObject();
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
        }).then(() => {
            console.log('retiredFormCount: ' + retiredFormCount);
            console.log('Finished retireNindsForms().');
            resolve();
        }, err => {
            reject(err);
        });
    });
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
