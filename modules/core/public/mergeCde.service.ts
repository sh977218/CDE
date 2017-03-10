import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { MergeShareService } from "mergeShare.service";

@Injectable()
export class MergeCdeService {
    constructor(private http:Http, private mergeShareService:MergeShareService) {
    }

    private getCdeByTinyId(tinyId) {
        this.http.get('/debytinyid/' + tinyId).map((res) => res.json());
    }

    public doMerge(tinyIdFrom, tinyIdTo, fields, cb) {
        let cdeFrom = this.getCdeByTinyId(tinyIdFrom);
        let cdeTo = this.getCdeByTinyId(tinyIdTo);
        if (fields.naming) {
            this.mergeShareService.mergeArray(cdeFrom.naming, cdeTo.naming);
        }
        if (fields.referenceDocuments) {
            this.mergeShareService.mergeArray(cdeFrom.referenceDocuments, cdeTo.referenceDocuments);
        }
        if (fields.properties) {
            this.mergeShareService.mergeArray(cdeFrom.properties, cdeTo.properties);
        }
        if (fields.ids) {
            this.mergeShareService.mergeArray(cdeFrom.ids, cdeTo.ids);
        }
        this.http.post("/mergeCde", {
            mergeFrom: cdeFrom,
            mergeTo: cdeTo
        }).subscribe((data) => {

        }, (err) => {

        });
    }
}
