import { Injectable } from "@angular/core";
import * as classificationShared from "../../system/shared/classificationShared.js"

@Injectable()
export class MergeShareService {
    constructor() {
    }

    public mergeArrayByProperty(arrayFrom, arrayTo, property) {
        arrayTo[property] = arrayTo[property].concat(arrayFrom[property]);
    }

    public mergeClassifications(mergeFrom, mergeTo) {
        classificationShared.transferClassifications(mergeFrom, mergeTo);
    }

}