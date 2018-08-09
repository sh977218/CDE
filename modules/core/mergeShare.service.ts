import { Injectable } from '@angular/core';
import { transferClassifications } from 'shared/system/classificationShared';

@Injectable()
export class MergeShareService {
    mergeArrayByProperty(arrayFrom, arrayTo, property) {
        arrayFrom[property].forEach((objFrom) => {
            let exist = arrayTo[property].filter((objTo) => JSON.stringify(objTo) === JSON.stringify(objFrom)).length > 0;
            if (!exist) arrayTo[property].push(objFrom);
        });
    }

    mergeClassifications(mergeFrom, mergeTo) {
        transferClassifications(mergeFrom, mergeTo);
    }
}
