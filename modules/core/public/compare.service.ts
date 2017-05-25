import { Injectable } from "@angular/core";
import * as _ from "lodash";

@Injectable()
export class CompareService {
    doCompare(left, right, options) {
        let result = _.reduce(left, function (result, value, key) {
            let temp = _.isEqual(value, right[key]) ?
                result : result.concat(key);
            return temp;
        }, []);
        console.log('a');
    }
}

