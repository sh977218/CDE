import { Injectable } from "@angular/core";
import * as _ from "lodash";

@Injectable()
export class CompareService {
    doCompare(left, right, options) {
        let result = {};
        _.forOwn(options, (pValue, pKey) => {
            let l = left[pKey];
            let r = right[pKey];
            if (_.isEmpty(pValue))
                result[pKey] = {
                    match: _.isEqual(l, r),
                    left: l,
                    right: r
                };
            else {
                let temp = this.doCompare(l, r, pValue);
                if (!temp["match"])
                    result["match"] = false;
                result[pKey] = temp;
            }
        });
        console.log('a');
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
    }
}

