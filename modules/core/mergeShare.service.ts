import { Injectable } from "@angular/core";
import { SharedService } from '_commonApp/shared.service';

@Injectable()
export class MergeShareService {
    constructor() {
    }

    public mergeArrayByProperty(arrayFrom, arrayTo, property) {
        arrayFrom[property].forEach((objFrom) => {
            let exist = arrayTo[property].filter((objTo) => {
                return JSON.stringify(objTo) === JSON.stringify(objFrom);
                }).length > 0;
            if (!exist) arrayTo[property].push(objFrom);
        });
    }

    public mergeClassifications(mergeFrom, mergeTo) {
        SharedService.classificationShared.transferClassifications(mergeFrom, mergeTo);
    }

}