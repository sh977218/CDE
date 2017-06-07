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

    copyValue(obj, data) {
        _.forEach(data, d => {
            obj[d.property] = _.get(obj, d.property);
        });
    }

    doCompareArrayImpl(newer, older, option) {
        option.result = [];
        let beginIndex = 0;

        _.forEach(newer, l => {
            let rightArrayCopy = _.slice(older, beginIndex);
            let rightIndex = _.findIndex(rightArrayCopy, o => option.isEqual(o, l));
            if (rightIndex === -1) {
                this.copyValue(l, option.data);
                option.result.push({
                    match: false,
                    removed: true,
                    data: l,
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
                        add: true,
                        data: rightArrayCopy[k],
                        left: null,
                        right: rightArrayCopy[k]
                    });
                    beginIndex++;
                }
                let tempResult = {
                    match: true,
                    display: l.display && r.display
                };
                let lCopy = {};
                let rCopy = {};
                let diff = _.uniq(_.concat(l.diff, r.diff));
                if (!_.isEmpty(diff)) {
                    option.data.forEach(d => {
                        lCopy[d.property] = _.get(l, d.property);
                        rCopy[d.property] = _.get(r, d.property);
                    });
                    tempResult["left"] = lCopy;
                    tempResult["right"] = rCopy;
                    tempResult["diff"] = diff;
                    tempResult["edited"] = true;
                }
                option.result.push(tempResult);
                beginIndex++;
            }
        });
        if (option.result) {
            option.match = !(option.result.filter(p => !p.match).length > 0);
            option.display = option.result.filter(p => p.display).length > 0;
            let addResultArray = option.result.filter(r1 => r1.add);
            let removeResultArray = option.result.filter(r1 => r1.removed);
            option.result.forEach(r => {
                if (r.add && _.findIndex(removeResultArray, o => {
                        return _.isEqual(o.data, r.data)
                    }) !== -1) {
                    r.reorder = true;
                }
                if (r.removed && _.findIndex(addResultArray, o => {
                        return _.isEqual(o.data, r.data)
                    }) !== -1) {
                    r.reorder = true;
                }
            });
            option.result = _.uniqWith(option.result, (a, b) => {
                return a.reorder && b.reorder && _.isEqual(a.data, b.data);
            })
        }
    }

    doCompareArray(newer, older, option) {
        _.forEach(option, property => {
            if (!newer && !older) {
                property.match = true;
                property.display = false;
                return;
            }
            if (!property.isEqual) property.isEqual = _.isEqual;
            let l = [];
            if (newer) l = _.get(newer, property.property);
            let r = [];
            if (older) r = _.get(older, property.property);
            this.doCompareArrayImpl(l, r, property);
        });
    }
}

