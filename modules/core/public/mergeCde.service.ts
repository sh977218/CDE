import { Injectable, Inject } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/observable/forkJoin";
import { MergeShareService } from "./mergeShare.service";
import * as ClassificationShared from "../../system/shared/classificationShared.js";

@Injectable()
export class MergeCdeService {
    constructor(private http: Http,
                private mergeShareService: MergeShareService,
                @Inject("isAllowedModel") private isAllowedModel) {
    }

    public getCdeByTinyId(tinyId) {
        return this.http.get("/de/" + tinyId).map(res => res.json());
    }

    public doMerge(tinyIdFrom, tinyIdTo, fields, cb) {
        if (tinyIdFrom === tinyIdTo) {
            return cb();
        } else {
            let cdeFromObservable = this.getCdeByTinyId(tinyIdFrom);
            let cdeToObservable = this.getCdeByTinyId(tinyIdTo);
            Observable.forkJoin([cdeFromObservable, cdeToObservable]).subscribe(results => {
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
                    let ownCdeFrom = this.isAllowedModel.isAllowed(cdeFrom);
                    this.http.post("/mergeCde", {
                        mergeFrom: cdeFrom,
                        mergeTo: cdeTo,
                        retireCde: fields.retireCde && ownCdeFrom
                    }).map(res => res.text()).subscribe((result) => {
                        cb(null, result);
                    }, err => cb("Unable to mergeCde " + tinyIdFrom));
                },
                err => cb("unable to get cde " + err)
            );
        }
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

    public approveMerge (source, destination, fields, callback) {
        this.http.get('/de/' + source.tinyId).map(r => r.json()).subscribe(result => {
            source = result;
            this.http.get('/de/' + destination.tinyId).map(r => r.json()).subscribe(result => {
                destination = result;
                Object.keys(fields).forEach(field => {
                    if (fields[field]) {
                        this.transferFields(source, destination, field);
                    }
                });

                if (fields.ids || fields.properties || fields.naming) {
                    ClassificationShared.transferClassifications(source, destination);
                    this.http.put("/de/" + result.tinyId, result).subscribe(() => {
                        this.retireSource(source, destination, response => {
                            if (callback) callback(response);
                        });
                    });
                } else {
                    this.classifyByTinyIds(source.tinyId, destination.tinyId, callback);
                }
            });

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
