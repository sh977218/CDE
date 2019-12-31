import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataElement } from 'shared/de/dataElement.model';
import { mergeArrayByProperty } from 'core/adminItem/classification';
import { transferClassifications } from 'shared/system/classificationShared';
import { DeMergeFields } from './mergeDataElement/deMergeFields.model';

@Injectable()
export class MergeDeService {
    constructor(private http: HttpClient) {
    }

    async doMerge(tinyIdFrom: string,
                  tinyIdTo: string,
                  fields: DeMergeFields) {
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
            mergeArrayByProperty(cdeFrom, cdeTo, 'designations');
        }
        if (fields.definitions) {
            mergeArrayByProperty(cdeFrom, cdeTo, 'definitions');
        }
        if (fields.referenceDocuments) {
            mergeArrayByProperty(cdeFrom, cdeTo, 'referenceDocuments');
        }
        if (fields.properties) {
            mergeArrayByProperty(cdeFrom, cdeTo, 'properties');
        }
        if (fields.ids) {
            mergeArrayByProperty(cdeFrom, cdeTo, 'ids');
        }
        if (fields.attachments) {
            mergeArrayByProperty(cdeFrom, cdeTo, 'attachments');
        }
        if (fields.dataSets) {
            mergeArrayByProperty(cdeFrom, cdeTo, 'dataSets');
        }
        if (fields.derivationRules) {
            mergeArrayByProperty(cdeFrom, cdeTo, 'derivationRules');
        }
        if (fields.sources) {
            mergeArrayByProperty(cdeFrom, cdeTo, 'sources');
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
