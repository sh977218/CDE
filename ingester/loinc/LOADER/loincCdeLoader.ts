import { isEmpty } from 'lodash';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { createCde, compareCde, mergeCde } from '../CDE/cde';
import { batchloader, updateCde } from '../../shared/utility';

export async function runOneCde(loinc, orgInfo) {
    let loincId = loinc.loincId;
    let cdeCond = {archived: false, 'ids.id': loincId};
    let newCdeObj = await createCde(loinc, orgInfo);
    let existingCde = await DataElement.findOne(cdeCond);
    if (!existingCde) {
        existingCde = await new DataElement(newCdeObj).save();
    } else {
        existingCde.imported = new Date().toJSON();
        existingCde.lastMigrationScript = 'loadPhenXJuly2019';

        let diff = compareCde(newCdeObj, existingCde);
        if (isEmpty(diff)) {
            await existingCde.save().catch(e => {
                throw 'Error existingCde.save: ' + e;
            });
        } else {
            await mergeCde(newCdeObj, existingCde);
            await updateCde(existingCde, batchloader).catch(e => {
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