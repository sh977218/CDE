import { GET, POST } from 'common/fetch';
import { DeMergeFields } from 'compare/mergeDataElement/deMergeFields.model';
import {
    mergeArrayByAttachments,
    mergeArrayByDataSets,
    mergeArrayByDefinitions,
    mergeArrayByDerivationRules,
    mergeArrayByDesignations,
    mergeArrayByIds,
    mergeArrayByProperties,
    mergeArrayByReferenceDocuments,
    mergeArrayBySources
} from 'core/adminItem/classification';
import { transferClassifications } from 'shared/classification/classificationShared';
import { DataElement } from 'shared/de/dataElement.model';
import { ITEM_MAP } from 'shared/item';

export async function doMerge(tinyIdFrom: string, tinyIdTo: string, fields: DeMergeFields) {
    if (tinyIdFrom === tinyIdTo) {
        throw new Error('You cannot merge same data elements.');
    }
    const cdeFrom = await getCdeByTinyId(tinyIdFrom);
    const cdeTo = await getCdeByTinyId(tinyIdTo);
    if (cdeFrom.isDraft) {
        throw new Error(`You cannot merge draft data element. ${cdeFrom.tinyId}`);
    }
    if (cdeTo.isDraft) {
        throw new Error(`You cannot merge draft data element. ${cdeTo.tinyId}`);
    }

    if (fields.designations) {
        mergeArrayByDesignations(cdeFrom, cdeTo);
    }
    if (fields.definitions) {
        mergeArrayByDefinitions(cdeFrom, cdeTo);
    }
    if (fields.referenceDocuments) {
        mergeArrayByReferenceDocuments(cdeFrom, cdeTo);
    }
    if (fields.properties) {
        mergeArrayByProperties(cdeFrom, cdeTo);
    }
    if (fields.ids) {
        mergeArrayByIds(cdeFrom, cdeTo);
    }
    if (fields.attachments) {
        mergeArrayByAttachments(cdeFrom, cdeTo);
    }
    if (fields.dataSets) {
        mergeArrayByDataSets(cdeFrom, cdeTo);
    }
    if (fields.derivationRules) {
        mergeArrayByDerivationRules(cdeFrom, cdeTo);
    }
    if (fields.sources) {
        mergeArrayBySources(cdeFrom, cdeTo);
    }
    if (fields.classifications) {
        transferClassifications(cdeFrom, cdeTo);
    }
    if (fields.retireCde) {
        cdeFrom.changeNote = 'Merged to tinyId ' + cdeTo.tinyId;
        cdeFrom.registrationState.registrationStatus = 'Retired';
    }
    cdeTo.changeNote = 'Merged from tinyId ' + cdeFrom.tinyId;
    return {left: await putDeByTinyId(cdeFrom), right: await putDeByTinyId(cdeTo)};
}

function getCdeByTinyId(tinyId: string): Promise<DataElement> {
    return GET(ITEM_MAP.cde.api + tinyId);
}

function putDeByTinyId(elt: DataElement): Promise<DataElement> {
    return POST('/server/de/publishExternal', elt);
}
