import { Injectable, Inject } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/observable/forkJoin";
import { MergeShareService } from "./mergeShare.service";

@Injectable()
export class MergeCdeService {
    constructor(private http: Http, private mergeShareService: MergeShareService,
                @Inject("isAllowedModel") private isAllowedModel) {
    }

    public getCdeByTinyId(tinyId) {
        //noinspection TypeScriptValidateTypes
        return this.http.get("/debytinyid/" + tinyId).map(res => res.json());
    }

    public doMerge(tinyIdFrom, tinyIdTo, fields, cb) {
        if (tinyIdFrom === tinyIdTo) {
            return cb();
        } else {
            let cdeFromObservable = this.getCdeByTinyId(tinyIdFrom);
            let cdeToObservable = this.getCdeByTinyId(tinyIdTo);
            //noinspection TypeScriptUnresolvedFunction
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
}
