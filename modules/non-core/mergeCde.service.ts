import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { mergeArrayByProperty } from 'core/adminItem/classification';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { DataElement } from 'shared/de/dataElement.model';
import { CbErr, ElasticQueryResponseForm } from 'shared/models.model';
import { SearchSettings } from 'shared/search/search.model';
import { transferClassifications } from 'shared/system/classificationShared';
import { toPromise } from 'rxjs-compat/operator/toPromise';

export interface MergeFieldsDe {
    attachments: boolean;
    classifications: boolean;
    dataSets: boolean;
    definitions: boolean;
    derivationRules: boolean;
    designations: boolean;
    ids: boolean;
    properties: boolean;
    referenceDocuments: boolean;
    retireCde: boolean;
    sources: boolean;
}

@Injectable()
export class MergeCdeService {
    constructor(
        private alert: AlertService,
        private elasticService: ElasticService,
        private http: HttpClient) {
    }

    async doMerge(tinyIdFrom: string,
                  tinyIdTo: string,
                  fields: MergeFieldsDe,
                  cb: CbErr<[DataElement, DataElement]>) {
        if (tinyIdFrom === tinyIdTo) { return cb(); }
        const cdeFrom = await this.getCdeByTinyId(tinyIdFrom).toPromise();
        const cdeTo = await this.getCdeByTinyId(tinyIdTo).toPromise();

        if (fields.designations) { mergeArrayByProperty(cdeFrom, cdeTo, 'designations'); }
        if (fields.definitions) { mergeArrayByProperty(cdeFrom, cdeTo, 'definitions'); }
        if (fields.referenceDocuments) { mergeArrayByProperty(cdeFrom, cdeTo, 'referenceDocuments'); }
        if (fields.properties) { mergeArrayByProperty(cdeFrom, cdeTo, 'properties'); }
        if (fields.ids) { mergeArrayByProperty(cdeFrom, cdeTo, 'ids'); }
        if (fields.attachments) { mergeArrayByProperty(cdeFrom, cdeTo, 'attachments'); }
        if (fields.dataSets) { mergeArrayByProperty(cdeFrom, cdeTo, 'dataSets'); }
        if (fields.derivationRules) { mergeArrayByProperty(cdeFrom, cdeTo, 'derivationRules'); }
        if (fields.sources) { mergeArrayByProperty(cdeFrom, cdeTo, 'sources'); }
        if (fields.classifications) { transferClassifications(cdeFrom, cdeTo); }
        if (fields.retireCde) {
            cdeFrom.changeNote = 'Merged to tinyId ' + cdeTo.tinyId;
            cdeFrom.registrationState.registrationStatus = 'Retired';
        }
        cdeTo.changeNote = 'Merged from tinyId ' + cdeFrom.tinyId;
        const fromResult = await this.putDeByTinyId(cdeFrom).toPromise();
        const toResult = await this.putDeByTinyId(cdeTo).toPromise();

        cb(undefined, [fromResult, toResult]);
    }

    getCdeByTinyId(tinyId: string) {
        return this.http.get<DataElement>('/de/' + tinyId);
    }

    putDeByTinyId(elt: DataElement) {
        return this.http.post<DataElement>('/dePublishExternal', elt);
    }
}
