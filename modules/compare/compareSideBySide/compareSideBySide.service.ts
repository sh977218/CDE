import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class CompareSideBySideService {

    doCompare(left, right, options) {
        this.init(left, right, options);
        let leftType = typeof left;
        let rightType = typeof right;
        if (leftType !== rightType)
            return "Type unmatched. left: " + leftType + " right: " + rightType;
    }

    init(left, right, options) {
        if (!left) left = {};
        if (!right) right = {};
        if (!options) {
            let allKeys = _.uniq(Object.keys(left).concat(Object.keys(right))).map(k => {
                return {key: k, value: k};
            });
            options = allKeys;
        }
    }
}