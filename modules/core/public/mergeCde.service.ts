import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/observable/forkJoin";
import { MergeShareService } from "./mergeShare.service";
import { ElasticService } from 'core/public/elastic.service';
import { AlertService } from 'system/public/components/alert/alert.service';

@Injectable()
export class MergeCdeService {
    constructor(private http: Http,
                private elasticService: ElasticService,
                private alert: AlertService,
                private mergeShareService: MergeShareService
                ) {
    }

    public getCdeByTinyId(tinyId) {
        return this.http.get("/de/" + tinyId).map(res => res.json());
    }

    public putDeByTinyId(elt) {
        return this.http.put("/de/" + elt.tinyId, elt).map(res => res.json());
    }

    public doMerge(tinyIdFrom, tinyIdTo, fields, cb) {
        if (tinyIdFrom === tinyIdTo) return cb();
        let getDeFromObservable = this.getCdeByTinyId(tinyIdFrom);
        let getDeToObservable = this.getCdeByTinyId(tinyIdTo);
        Observable.forkJoin([getDeFromObservable, getDeToObservable]).subscribe(results => {
                let cdeFrom = results[0];
                let cdeTo = results[1];
                if (fields.naming)
                    this.mergeShareService.mergeArrayByProperty(cdeFrom, cdeTo, "naming");
                if (fields.referenceDocuments)
                    this.mergeShareService.mergeArrayByProperty(cdeFrom, cdeTo, "referenceDocuments");
                if (fields.properties)
                    this.mergeShareService.mergeArrayByProperty(cdeFrom, cdeTo, "properties");
                if (fields.ids)
                    this.mergeShareService.mergeArrayByProperty(cdeFrom, cdeTo, "ids");
                if (fields.attachments)
                    this.mergeShareService.mergeArrayByProperty(cdeFrom, cdeTo, "attachments");
                if (fields.dataSets)
                    this.mergeShareService.mergeArrayByProperty(cdeFrom, cdeTo, "dataSets");
                if (fields.derivationRules)
                    this.mergeShareService.mergeArrayByProperty(cdeFrom, cdeTo, "derivationRules");
                if (fields.sources)
                    this.mergeShareService.mergeArrayByProperty(cdeFrom, cdeTo, "sources");
                if (fields.classifications)
                    this.mergeShareService.mergeClassifications(cdeFrom, cdeTo);
                if (fields.retireCde) {
                    let searchSettings = this.elasticService.defaultSearchSettings;
                    searchSettings.q = '"' + cdeFrom.tinyId + '"';
                    this.elasticService.generalSearchQuery(this.elasticService.buildElasticQuerySettings(searchSettings), 'form', (err, result) => {
                        if (err) return this.alert.addAlert("danger", err);
                        if (!result || !result.forms || result.forms.length < 2) {
                            cdeFrom.changeNote = "Merged to tinyId " + cdeTo.tinyId;
                            cdeFrom.registrationState.registrationStatus = "Retired";
                        }
                        cdeTo.changeNote = "Merged from tinyId " + cdeFrom.tinyId;
                        let putDeFromObservable = this.putDeByTinyId(cdeFrom);
                        let putDeToObservable = this.putDeByTinyId(cdeTo);
                        Observable.forkJoin([putDeFromObservable, putDeToObservable]).subscribe(results => {
                            cb(null, results);
                        }, err => cb("Unable to mergeCde " + tinyIdFrom + ". Err:" + err));
                    });
                }
            }, err => cb("unable to get cde " + err)
        );
    }


    public transferFields (source, destination, type) {
        if (!source[type]) return;

        let alreadyExists = function (obj) {
            delete obj.$$hashKey;
            return destination[type].map(function (obj) {
                return JSON.stringify(obj);
            }).indexOf(JSON.stringify(obj)) >= 0;
        };
        source[type].forEach(obj => {
            if (alreadyExists(obj)) return;
            destination[type].push(obj);
        });
    };

    private classifyByTinyIds (tinyIdSource, tinyIdTarget, cb) {
        this.http.post('/classification/cde/moveclassif', {
            cdeSource: {tinyId: tinyIdSource},
            cdeTarget: {tinyId: tinyIdTarget}
        }).map(r => r.json()).subscribe(cb, cb);
    }

    public retireSource = function (source, destination, cb) {
        this.http.post("/retireCde", {cde: source, merge: destination}).map(r => r.json()).subscribe(response => {
            if (cb) cb(response);
        });
    };


}
