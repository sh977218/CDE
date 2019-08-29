import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { mergeArrayByProperty } from 'core/adminItem/classification';
import { SearchSettings } from 'search/search.model';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { DataElement } from 'shared/de/dataElement.model';
import { CbErr, ElasticQueryResponseForm } from 'shared/models.model';
import { transferClassifications } from 'shared/system/classificationShared';

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


    doMerge(tinyIdFrom: string, tinyIdTo: string, fields: MergeFieldsDe, cb: CbErr<[DataElement, DataElement]>) {
        if (tinyIdFrom === tinyIdTo) { return cb(); }
        const getDeFromObservable = this.getCdeByTinyId(tinyIdFrom);
        const getDeToObservable = this.getCdeByTinyId(tinyIdTo);
        forkJoin([getDeFromObservable, getDeToObservable]).subscribe(results => {
                const cdeFrom = results[0];
                const cdeTo = results[1];
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
                    const searchSettings = new SearchSettings();
                    searchSettings.q = '"' + cdeFrom.tinyId + '"';
                    this.elasticService.generalSearchQuery(this.elasticService.buildElasticQuerySettings(searchSettings), 'form',
                        (err?: string, result?: ElasticQueryResponseForm) => {
                        if (err) { return this.alert.addAlert('danger', err); }
                        if (!result || !result.forms || result.forms.length < 2) {
                            cdeFrom.changeNote = 'Merged to tinyId ' + cdeTo.tinyId;
                            cdeFrom.registrationState.registrationStatus = 'Retired';
                        }
                        cdeTo.changeNote = 'Merged from tinyId ' + cdeFrom.tinyId;
                        const putDeFromObservable = this.putDeByTinyId(cdeFrom);
                        const putDeToObservable = this.putDeByTinyId(cdeTo);
                        forkJoin([putDeFromObservable, putDeToObservable]).subscribe(results => {
                            cb(undefined, results);
                        }, err => cb('Unable to mergeCde ' + tinyIdFrom + '. Err:' + err));
                    });
                }
            }, err => cb('unable to get cde ' + err)
        );
    }

    getCdeByTinyId(tinyId: string) {
        return this.http.get<DataElement>('/de/' + tinyId);
    }

    putDeByTinyId(elt: DataElement) {
        return this.http.post<DataElement>('/dePublishExternal', elt);
    }
}
