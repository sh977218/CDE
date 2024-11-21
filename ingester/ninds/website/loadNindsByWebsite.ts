import {remove, uniq} from 'lodash';
import {eachLimit} from 'async';
import {createNindsCde} from 'ingester/ninds/website/cde/cde';
import {createNindsForm} from 'ingester/ninds/website/form/form';
import {doNindsClassification, loadNindsCde, loadNindsForm} from 'ingester/ninds/shared';
import {dataElementModel} from 'server/cde/mongo-cde';
import {formModel} from 'server/form/mongo-form';
import {
    BATCHLOADER,
    findOneCde,
    findOneForm,
    imported,
    lastMigrationScript,
    retiredElt,
    updateCde,
    updateForm,
    updateRawArtifact
} from 'ingester/shared/utility';

function removeNindsNonePreclinicalClassification(elt: any) {
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

function isPhq9(nindsForms: any[]) {
    const phq9FormIds = ['F2032', 'F0374'];
    return nindsForms.filter(nindsForm => phq9FormIds.indexOf(nindsForm.formId) !== -1).length > 0;
}

function loadNindsCdes() {
    return new Promise(async (resolve, reject) => {

        const cdeIds = await NindsModel.distinct('cdes.CDE ID');
//        const cdeIds = await NindsModel.distinct('cdes.CDE ID', {formId: 'F0004'});
//        const cdeIds = ['C19372'];
        eachLimit(cdeIds, 500, async cdeId => {
            const nindsForms = await NindsModel.find({'cdes.CDE ID': cdeId},
                {
                    _id: 0,
                    diseaseName: 1,
                    subDiseaseName: 1,
                    domainName: 1,
                    subDomainName: 1,
                    formId: 1,
                    cdes: {$elemMatch: {'CDE ID': cdeId}}
                }).lean();
            const de = await createNindsCde(nindsForms);
            const cond = {
                archived: false,
                ids: {
                    $elemMatch: {
                        source: 'NINDS',
                        id: cdeId
                    }
                },
                'registrationState.registrationStatus': {$ne: 'Retired'}
            };
            if (isPhq9(nindsForms)) {
                const newDe = new dataElementModel(de);
                const newCdeObj = newDe.toObject();
                const existingCdes: any[] = await dataElementModel.find(cond);
                const existingCde: any = findOneCde(existingCdes);
                const existingCdeObj = existingCde.toObject();
                doNindsClassification(existingCdeObj, newDe.toObject());
                existingCde.classification = existingCdeObj.classification;
                existingCde.lastMigrationScript = lastMigrationScript;
                existingCde.imported = imported;
                await existingCde.save();
                await updateRawArtifact(existingCde, newCdeObj, 'NINDS', 'NINDS');
            } else {
                await loadNindsCde(de, cond, 'NINDS');
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

async function duplicateFormIds(formIds: string[]) {
    const duplicateFormIds = [];
    for (const formId of formIds) {
        const cond = {
            archived: false,
            'ids.id': formId,
            ids: {
                $elemMatch: {
                    source: 'NINDS',
                    id: formId
                }
            },
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
            const nindsIds = formObj.ids.filter((i: any) => i.source === 'NINDS');
            if (nindsIds.length === 0) {
                console.log(`form ${formId} has 0 NINDS ID`);
                process.exit(1);
            }
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
//        const formIds = await NindsModel.distinct('formId');
//        const formIds = ['F2105'];
        formIds.sort();
        await duplicateFormIds(formIds);
//        eachLimit(formIds.filter(formId => ['F0807', 'F1006'].indexOf(formId) !== -1), 1, async formId => {
        eachLimit(formIds, 1, async formId => {
            const cond: any = {
                archived: false,
                ids: {
                    $elemMatch: {
                        source: 'NINDS',
                        id: formId
                    }
                },
                'registrationState.registrationStatus': {$ne: 'Retired'}
            };
            const sameFormIds: any = sameFormIdsMap[formId];
            const nindsForms = await NindsModel.find({
                formId: {$in: [formId].concat(sameFormIds)}
            }).lean();
            const form = await createNindsForm(nindsForms);
            if (isPhq9(nindsForms)) {
                const newForm = new formModel(form);
                const newFormObj = newForm.toObject();
                const existingForms: any[] = await formModel.find(cond);
                const existingForm: any = findOneForm(existingForms);
                const existingFormObj = existingForm.toObject();
                doNindsClassification(existingFormObj, newForm.toObject());
                existingForm.classification = existingFormObj.classification;
                existingForm.lastMigrationScript = lastMigrationScript;
                existingForm.imported = imported;
                await existingForm.save();
                await updateRawArtifact(existingForm, newFormObj, 'NINDS', 'NINDS');
            } else {
                await loadNindsForm(form, cond, 'NINDS');
            }
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
        const condition = {
            archived: false,
            'classification.stewardOrg.name': 'NINDS',
            'registrationState.registrationStatus': {$ne: 'Retired'},
            lastMigrationScript: {$ne: lastMigrationScript}
        };
        dataElementModel.find(condition)
            .cursor({batchSize: 10})
            .eachAsync(async cdeToRetire => {
                const cdeObj = cdeToRetire.toObject();
                removeNindsNonePreclinicalClassification(cdeObj);
                if (cdeObj.classification.length < 1) {
                    retiredElt(cdeObj);
                    retiredCdeCount++;
                    console.log(`retire Cde: ${cdeObj.tinyId}`);
                    await updateCde(cdeObj, BATCHLOADER);
                }
                console.log('retiredCdeCount: ' + retiredCdeCount);
            })
            .then(() => {
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
        const condition = {
            archived: false,
            'classification.stewardOrg.name': 'NINDS',
            'registrationState.registrationStatus': {$ne: 'Retired'},
            lastMigrationScript: {$ne: lastMigrationScript}
        };
        formModel.find(condition)
            .cursor({batchSize: 10})
            .eachAsync(async formToRetire => {
                const formObj = formToRetire.toObject();
                removeNindsNonePreclinicalClassification(formObj);
                if (formObj.classification.length < 1) {
                    retiredElt(formObj);
                    retiredFormCount++;
                    console.log(`retire Form: ${formObj.tinyId}`);
                    await updateForm(formObj, BATCHLOADER);
                }
                console.log('retiredFormCount: ' + retiredFormCount);
            })
            .then(() => {
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
