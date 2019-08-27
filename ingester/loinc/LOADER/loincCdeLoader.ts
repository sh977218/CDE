import { isEmpty } from 'lodash';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { createCde,compareCde,mergeCde } from '../CDE/cde';
import { BATCHLOADER, updateCde, updatedByLoader } from 'ingester/shared/utility';

export async function runOneCde(loinc, orgInfo) {
    let loincId = loinc.loincId;
    let cdeCond = {
        archived: false,
        "registrationState.registrationStatus": {$ne: "Retired"},
        'ids.id': loincId
    };
    let newCdeObj = await createCde(loinc, orgInfo).catch(e => {
        throw 'Error CreateCDE.createCde: ' + e;
    });
    let existingCde = await DataElement.findOne(cdeCond).catch(e => {
        throw "Error DataElement.findOne: " + e;
    });

    if (!existingCde) {
        existingCde = await new DataElement(newCdeObj).save().catch(e => {
            throw 'Error new DataElement: ' + e;
        });
    } else if (updatedByLoader(existingCde)) {
    } else {
        existingCde.imported = new Date().toJSON();
        existingCde.markModified('imported');
        let diff = compareCde(newCdeObj, existingCde);
        if (isEmpty(diff)) {
            await existingCde.save().catch(e => {
                throw 'Error existingCde.save: ' + e;
            });
        } else {
            await mergeCde(newCdeObj, existingCde);
            await updateCde(existingCde, BATCHLOADER).catch(e => {
                throw 'Error mongo_cde.updatePromise: ' + e;
            });
        }
    }
    delete newCdeObj.tinyId;
    let updateResult = await DataElementSource.updateOne({tinyId: existingCde.tinyId}, newCdeObj, {upsert: true}).catch(e => {
        throw'Error await DataElementSource.updateOne({tinyId: existingCde.tinyId}: ' + e;
    });
    console.log(updateResult.nModified + ' cde source modified: ');

    return existingCde;
}