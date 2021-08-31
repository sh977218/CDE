import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeMergeFields } from 'compare/mergeDataElement/deMergeFields.model';
import {
    mergeArrayByAttachments, mergeArrayByDataSets, mergeArrayByDefinitions, mergeArrayByDerivationRules, mergeArrayByDesignations,
    mergeArrayByIds, mergeArrayByProperties, mergeArrayByReferenceDocuments, mergeArrayBySources
} from 'core/adminItem/classification';
import { transferClassifications } from 'shared/classification/classificationShared';
import { DataElement } from 'shared/de/dataElement.model';

@Injectable()
export class MergeDeService {
    constructor(private http: HttpClient) {
    }

    async doMerge(tinyIdFrom: string, tinyIdTo: string, fields: DeMergeFields) {
        if (tinyIdFrom === tinyIdTo) {
            throw new Error('You cannot merge same data elements.');
        }
        const cdeFrom = await this.getCdeByTinyId(tinyIdFrom).toPromise();
        const cdeTo = await this.getCdeByTinyId(tinyIdTo).toPromise();
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
        const fromResult = await this.putDeByTinyId(cdeFrom).toPromise();
        const toResult = await this.putDeByTinyId(cdeTo).toPromise();
        return {left: fromResult, right: toResult};
    }

    getCdeByTinyId(tinyId: string) {
        return this.http.get<DataElement>('/api/de/' + tinyId);
    }

    putDeByTinyId(elt: DataElement) {
        return this.http.post<DataElement>('/server/de/publishExternal', elt);
    }
}
