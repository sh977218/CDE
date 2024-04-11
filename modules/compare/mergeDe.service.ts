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
    mergeArrayBySources,
} from 'core/adminItem/classification';
import { transferClassifications } from 'shared/classification/classificationShared';
import { ITEM_MAP } from 'shared/item';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataElement } from 'shared/de/dataElement.model';

@Injectable({
    providedIn: 'root',
})
export class MergeDeService {
    constructor(private http: HttpClient) {}

    async doMerge(tinyIdFrom: string, tinyIdTo: string, fields: DeMergeFields) {
        if (tinyIdFrom === tinyIdTo) {
            throw new Error('You cannot merge same data elements.');
        }
        const cdeFrom = await this.http.get<DataElement>(ITEM_MAP.cde.api + tinyIdFrom).toPromise();
        const cdeTo = await this.http.get<DataElement>(ITEM_MAP.cde.api + tinyIdTo).toPromise();
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
            cdeFrom.registrationState.administrativeNote = `Merged to tinyId: ${cdeTo.tinyId}`;
            cdeFrom.registrationState.mergedTo = { tinyId: cdeTo.tinyId };
        }
        cdeTo.changeNote = 'Merged from tinyId ' + cdeFrom.tinyId;
        return {
            left: await this.http.post('/server/de/publishExternal', cdeFrom).toPromise(),
            right: await this.http.post('/server/de/publishExternal', cdeTo).toPromise(),
        };
    }
}
