import { Injectable } from "@angular/core";
import * as classificationShared from "../../system/shared/classificationShared.js";

@Injectable()
export class MergeShareService {
    constructor() {
    }

    public mergeArrayByProperty(arrayFrom, arrayTo, property) {
        arrayFrom.forEach((objFrom) => {
            let exist = arrayTo.filter((objTo) => {
                return JSON.stringify(objTo) === JSON.stringify(objFrom);
            });
            if (!exist) arrayTo.push(objFrom);
        });
    }

    public mergeClassifications(mergeFrom, mergeTo) {
        classificationShared.transferClassifications(mergeFrom, mergeTo);
    }

}