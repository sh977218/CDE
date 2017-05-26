import { Injectable } from "@angular/core";
import * as _ from "lodash";

@Injectable()
export class CompareService {
    doCompare(left, right, options) {
        let result = {};
        options.forEach(p => {
            result["result"] = this.doCompare(left[p], right[p], p);
        });
        return result;
        /*
        _.reduce(left, function (result, value, key) {
         console.log(key);
         console.log(value);
         return _.isEqualWith(value, right[key], (l, r) => {
         return _.isEqual(l, r);
         }) ? result : result.concat(key);
        }, []);
         */

        console.log('a');
    }
}

