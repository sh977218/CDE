import { Injectable } from "@angular/core";
import * as _ from "lodash";

@Injectable()
export class CompareService {

    doCompareObject(left, right, option) {
        _.forEach(option, property => {
            if (!left && !right) {
                property.match = true;
                property.left = "";
                property.right = "";
                return;
            }
            let l = "";
            if (left) l = _.get(left, property.property);
            let r = "";
            if (right) r = _.get(right, property.property);
            if (!property.data) {
                property.match = _.isEqual(l, r);
                property.left = l ? l.toString() : "";
                property.right = r ? r.toString() : "";
                if (!left && !right) property.match = true;
            } else {
                this.doCompareObject(l, r, property.data);
                if (property.data) property.match = !(property.data.filter(p => !p.match).length > 0);
            }
        });
        return option;
    };

    static doCompareArrayValidator(left, right, option) {
        if (!_.isArray(left) || !_.isArray(right))
            throw ("compare array type does not match of option " + JSON.stringify(option));
        if (option.sort && !option.sortFn)
            throw ("sort function is missing");
        else if (!option.sort && option.sortFn)
            throw ("existing sort function but sort is missing");
        else if (option.sort && option.sortFn) {
            left.sort(option.sortFn);
            right.sort(option.sortFn);
        }
        if (!option.properties)
            option.properties = _.uniq(_.concat(Object.keys(left), Object.keys(right)));
        if (!option.equal) option.equal = _.isEqual;
    }

    copyValue(obj, data) {
        _.forEach(data, d => {
            obj[d.property] = _.get(obj, d.property);
        });
    }

    doCompareArrayImpl(left, right, option) {
        option.result = [];
        let beginIndex = 0;

        _.forEach(left, (l, leftIndex) => {
            let rightArrayCopy = _.slice(right, beginIndex);
            let rightIndex = _.findIndex(rightArrayCopy, o => option.isEqual(o, l));
            if (rightIndex === -1) {
                this.copyValue(l, option.data);
                option.result.push({
                    match: false,
                    left: l,
                    right: null
                });
            }
            // found match in right array
            else {
                let r = rightArrayCopy[rightIndex];
                for (let k = 0; k < rightIndex; k++) {
                    this.copyValue(rightArrayCopy[k], option.data);
                    option.result.push({
                        match: false,
                        left: null,
                        right: rightArrayCopy[k]
                    });
                    beginIndex++;
                }
                this.copyValue(l, option.data);
                this.copyValue(r, option.data);
                let tempResult = {
                    match: true,
                    left: l,
                    right: r,
                    display: l.display && r.display
                };
                let diff = _.uniq(_.concat(l.diff, r.diff));
                if (!_.isEmpty(diff)) tempResult["diff"] = diff;
                option.result.push(tempResult);
                beginIndex++;
            }
        });
        if (option.result) {
            option.match = !(option.result.filter(p => !p.match).length > 0);
            option.display = option.result.filter(p => p.display).length > 0;
            /*
             option.result.forEach(p => {
             p.diff = _.concat(left.diff, right.diff);
             })
             */
        }
    }

    doCompareArray(left, right, option) {
        _.forEach(option, property => {
            if (!left && !right) {
                property.match = true;
                property.left = "";
                property.right = "";
                return;
            }
            if (!property.isEqual) property.isEqual = _.isEqual;
            let l = [];
            if (left) l = _.get(left, property.property);
            let r = [];
            if (right) r = _.get(right, property.property);
            this.doCompareArrayImpl(l, r, property);
        });
    }

    static doCompareValidator(left, right, option) {
        if (!left && !right) {
            throw "left and right are both null";
        } else if (_.isArray(left) && _.isArray(right)) {
        } else if (!_.isArray(left) && _.isArray(right)) {
            throw "type miss match, left is not array, right is array";
        } else if (_.isArray(left) && !_.isArray(right)) {
            throw "type miss match, left is array, right is not array";
        }
    }

    findMatchInResult(left, right, result) {
        let tempMatch = true;
        _.forOwn(result, (v, k) => {
            if (!result[k].match)
                tempMatch = false;
        });
        result.match = tempMatch;
        /*
         result.left = left;
         result.right = right;
         */
    }
}

