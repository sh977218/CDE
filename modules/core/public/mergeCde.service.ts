import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/observable/forkJoin";
import { MergeShareService } from "./mergeShare.service";

@Injectable()
export class MergeCdeService {
    constructor(private http: Http, private mergeShareService: MergeShareService) {
    }

    private getCdeByTinyId(tinyId) {
        //noinspection TypeScriptValidateTypes
        return this.http.get("/debytinyid/" + tinyId).map(res => res.json());
    }

    public doMerge(tinyIdFrom, tinyIdTo, fields, cb) {
        let cdeFromObservable = this.getCdeByTinyId(tinyIdFrom);
        let cdeToObservable = this.getCdeByTinyId(tinyIdTo);
        //noinspection TypeScriptUnresolvedFunction
        Observable.forkJoin([cdeFromObservable, cdeToObservable]).subscribe(results => {
                let cdeFrom = results[0];
                let cdeTo = results[1];
                if (fields.naming)
                    this.mergeShareService.mergeArray(cdeFrom.naming, cdeTo.naming);
                if (fields.referenceDocuments)
                    this.mergeShareService.mergeArray(cdeFrom.referenceDocuments, cdeTo.referenceDocuments);
                if (fields.properties)
                    this.mergeShareService.mergeArray(cdeFrom.properties, cdeTo.properties);
                if (fields.ids)
                    this.mergeShareService.mergeArray(cdeFrom.ids, cdeTo.ids);
                this.http.post("/mergeCde", {
                    mergeFrom: cdeFrom,
                    mergeTo: cdeTo
                }).subscribe(() => cb(), err => cb("unable to mergeCde " + err));
            },
            err => cb("unable to get cde " + err)
        );
    }
}
