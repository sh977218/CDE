import { Injectable } from "@angular/core";
import * as _ from "lodash";

@Injectable()
export class CompareService {

    doCompareObject(newer, older, option) {
        _.forEach(option, property => {
            if (!newer && !older) {
                property.match = true;
                property.newer = "";
                property.older = "";
                return;
            }
            let l = "";
            if (newer) l = _.get(newer, property.property);
            let r = "";
            if (older) r = _.get(older, property.property);
            if (!property.data) {
                property.match = _.isEqual(l, r);
                property.newer = l ? l.toString() : "";
                property.older = r ? r.toString() : "";
                if (!newer && !older) property.match = true;
            } else {
                this.doCompareObject(l, r, property.data);
                if (property.data) property.match = !(property.data.filter(p => !p.match).length > 0);
            }
        });
        return option;
    };

    copyValue(obj, data) {
        _.forEach(data, d => {
            let value = _.get(obj, d.property);
            if (d.array) {
                if (_.isEmpty(value)) value = "";
                else value = JSON.stringify(value);
            }
            obj[d.property] = value;
        });
    }

    doCompareArrayImpl(newer, older, option) {
        option.result = [];
        let beginIndex = 0;

        _.forEach(newer, (l, leftIndex) => {
            let rightArrayCopy = _.slice(older, beginIndex);
            let rightIndex = _.findIndex(rightArrayCopy, o => option.isEqual(o, l));
            if (rightIndex === -1) {
                if (leftIndex === newer.length - 1) {
                    this.copyValue(l, option.data);
                    option.result.push({
                        match: false,
                        add: true,
                        data: l,
                        newer: l
                    });
                    rightArrayCopy.forEach(o => {
                        this.copyValue(o, option.data);
                        option.result.push({
                            match: false,
                            add: true,
                            data: o,
                            older: o
                        });
                    });
                } else {
                    this.copyValue(l, option.data);
                    option.result.push({
                        match: false,
                        add: true,
                        data: l,
                        newer: l
                    });
                }
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
                        older: rightArrayCopy[k]
                    });
                    beginIndex++;
                }
                let tempResult = {
                    match: true,
                    display: l.display && r.display
                };
                if (!l.diff) l.diff = [];
                if (!r.diff) r.diff = [];
                let diff = _.uniq(l.diff.concat(r.diff));
                if (!_.isEmpty(diff)) {
                    this.copyValue(l, option.data);
                    this.copyValue(r, option.data);
                }
                tempResult["older"] = l;
                tempResult["newer"] = r;
                tempResult["diff"] = diff;
                tempResult["edited"] = true;
                option.result.push(tempResult);
                beginIndex++;
            }
            if (leftIndex === newer.length - 1) {
                rightArrayCopy.forEach((o, i) => {
                    if (i > 0) {
                        this.copyValue(o, option.data);
                        option.result.push({
                            match: false,
                            add: true,
                            data: o,
                            older: o
                        });
                    }
                });
            }
        });
        if (option.result) {
            option.match = !(option.result.filter(p => !p.match).length > 0);
            option.display = option.result.filter(p => p.display).length > 0;
            option.result.forEach(r => {
                if (r.newer && r.add) {
                    if (_.findIndex(older, o => {
                            let temp = option.isEqual(o, r.data);
                            if (temp) r.older = _.cloneDeep(o);
                            return temp;
                        }) !== -1) {
                        delete r.add;
                        if (!r.match) r.diff = _.uniq(r.data.diff);
                        r.reorder = true;
                    }
                }
                if (r.older && r.add) {
                    if (_.findIndex(newer, o => option.isEqual(o, r.data)) === -1) {
                        delete r.add;
                        r.remove = true;
                    } else {
                        delete r.add;
                        if (!r.match) r.diff = _.uniq(r.data.diff);
                        r.reorder = true;
                    }
                }
            });
            option.result = _.uniqWith(option.result, (willRemove, willStay) => {
                if (willRemove.reorder && willStay.reorder) {
                    if (!willStay.newer) willStay.newer = willRemove.newer;
                    if (!willStay.older) willStay.older = willRemove.older;
                    let aData = _.cloneDeep(willRemove.data);
                    delete aData.diff;
                    let bData = _.cloneDeep(willStay.data);
                    delete bData.diff;
                    if (option.isEqual(aData, bData)) {
                        return true;
                    }
                }
                return false;
            });
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

