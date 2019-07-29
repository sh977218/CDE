import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { mergeArrayByProperty } from 'core/adminItem/classification';
import { SearchSettings } from 'search/search.model';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { DataElement } from 'shared/de/dataElement.model';
import { ElasticQueryResponse } from 'shared/models.model';
import { transferClassifications } from 'shared/system/classificationShared';


@Injectable()
export class MergeCdeService {
    constructor(
        private alert: AlertService,
        private elasticService: ElasticService,
        private http: HttpClient) {
    }


    doMerge(tinyIdFrom, tinyIdTo, fields, cb) {
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
                    this.elasticService.generalSearchQuery(this.elasticService.buildElasticQuerySettings(searchSettings), 'form', (err?: string, result?: ElasticQueryResponse) => {
                        if (err) { return this.alert.addAlert('danger', err); }
                        if (!result || !result.forms || result.forms.length < 2) {
                            cdeFrom.changeNote = 'Merged to tinyId ' + cdeTo.tinyId;
                            cdeFrom.registrationState.registrationStatus = 'Retired';
                        }
                        cdeTo.changeNote = 'Merged from tinyId ' + cdeFrom.tinyId;
                        const putDeFromObservable = this.putDeByTinyId(cdeFrom);
                        const putDeToObservable = this.putDeByTinyId(cdeTo);
                        forkJoin([putDeFromObservable, putDeToObservable]).subscribe(results => {
                            cb(null, results);
                        }, err => cb('Unable to mergeCde ' + tinyIdFrom + '. Err:' + err));
                    });
                }
            }, err => cb('unable to get cde ' + err)
        );
    }

    getCdeByTinyId(tinyId) {
        return this.http.get<DataElement>('/de/' + tinyId);
    }

    putDeByTinyId(elt) {
        return this.http.post('/dePublishExternal', elt);
    }

    retireSource(source, destination, cb) {
        this.http.post('/retireCde', {cde: source, merge: destination}).subscribe(response => {
            if (cb) { cb(response); }
        });
    }

    transferFields(source, destination, type) {
        if (!source[type]) { return; }

        const alreadyExists = function(obj) {
            delete obj.$$hashKey;
            return destination[type].map(function(obj) {
                return JSON.stringify(obj);
            }).indexOf(JSON.stringify(obj)) >= 0;
        };
        source[type].forEach(obj => {
            if (alreadyExists(obj)) { return; }
            destination[type].push(obj);
        });
    }
}
