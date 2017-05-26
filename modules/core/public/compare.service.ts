import { Injectable } from "@angular/core";
import * as _ from "lodash";

@Injectable()
export class CompareService {
    doCompare(left, right, options) {
        let result = [];
        _.reduce(left, function (result, value, key) {
            let temp = _.isEqual(value, right[key]);
            if (temp) return result;
            else {
                result.concat(key);
                return result;
            }
        }, []);
        console.log('a');
    }
}

