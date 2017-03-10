import { Injectable } from "@angular/core";

@Injectable()
export class MergeShareService {
    constructor() {
    }
    
    public mergeArray(arrayFrom, arrayTo) {
        arrayTo = arrayTo.concat(arrayFrom);
    }

}