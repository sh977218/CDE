import { Injectable } from '@angular/core';
import _cloneDeep from 'lodash/cloneDeep';
import _findIndex from 'lodash/findIndex';
import _forEach from 'lodash/forEach';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _slice from 'lodash/slice';
import _uniq from 'lodash/uniq';
import _uniqWith from 'lodash/uniqWith';


@Injectable()
export class CompareService {
    copyValue(obj, data) {
        _forEach(data, d => {
            let value = _get(obj, d.property);
            if (_isEmpty(value)) value = '';
            obj[d.property] = value;
        });
    }

    doCompareArray(newer, older, option) {
        _forEach(option, property => {
            if (!newer && !older) {
                property.match = true;
                property.display = false;
                return;
            }
            if (!property.isEqual) property.isEqual = _isEqual;
            let l = [];
            if (newer) l = _get(newer, property.property);
            let r = [];
            if (older) r = _get(older, property.property);
            this.doCompareArrayImpl(l, r, property);
        });
    }

    doCompareArrayImpl(newer: Array<any>, older: Array<any>, option) {
        option.result = [];
        let beginIndex = 0;

        _forEach(newer, (l, leftIndex) => {
            let rightArrayCopy = _slice(older, beginIndex);
            let rightIndex = _findIndex(rightArrayCopy, o => option.isEqual(o, l));
            if (rightIndex === -1) {
                if (leftIndex === newer.length - 1) {
                    option.result.push({
                        match: false,
                        add: true,
                        data: l,
                        newer: l
                    });
                    rightArrayCopy.forEach(o => {
                        option.result.push({
                            match: false,
                            add: true,
                            data: o,
                            older: o
                        });
                    });
                } else {
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
                let r: any = rightArrayCopy[rightIndex];
                for (let k = 0; k < rightIndex; k++) {
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
                let diff = _uniq(l.diff.concat(r.diff));
                tempResult['older'] = l;
                tempResult['newer'] = r;
                tempResult['diff'] = diff;
                tempResult['edited'] = true;
                option.result.push(tempResult);
                beginIndex++;
            }
            if (leftIndex === newer.length - 1) {
                rightArrayCopy.forEach((o, i) => {
                    if (i > 0) {
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
                    if (_findIndex(older, o => {
                            let temp = option.isEqual(o, r.data);
                            if (temp) r.older = _cloneDeep(o);
                            return temp;
                        }) !== -1) {
                        delete r.add;
                        if (!r.match) r.diff = _uniq(r.data.diff);
                        r.reorder = true;
                    }
                }
                if (r.older && r.add) {
                    if (_findIndex(newer, o => option.isEqual(o, r.data)) === -1) {
                        delete r.add;
                        r.remove = true;
                    } else {
                        delete r.add;
                        if (!r.match) r.diff = _uniq(r.data.diff);
                        r.reorder = true;
                    }
                }
            });
            option.result = _uniqWith(option.result, (willRemove: any, willStay) => {
                if (willRemove.reorder && willStay.reorder) {
                    if (!willStay.newer) willStay.newer = willRemove.newer;
                    if (!willStay.older) willStay.older = willRemove.older;
                    let aData = _cloneDeep(willRemove.data);
                    delete aData.diff;
                    let bData = _cloneDeep(willStay.data);
                    delete bData.diff;
                    if (option.isEqual(aData, bData)) {
                        return true;
                    }
                }
                if (willRemove.add && willStay.add) {
                    let aData = _cloneDeep(willRemove.data);
                    delete aData.diff;
                    let bData = _cloneDeep(willStay.data);
                    delete bData.diff;
                    if (option.isEqual(aData, bData)) {
                        return true;
                    }
                }
                if (willRemove.remove && willStay.remove) {
                    let aData = _cloneDeep(willRemove.data);
                    delete aData.diff;
                    let bData = _cloneDeep(willStay.data);
                    delete bData.diff;
                    if (option.isEqual(aData, bData)) {
                        return true;
                    }
                }
                return false;
            });
            option.result.forEach(r => {
                if (r.data) this.copyValue(r.data, option.data);
                if (r.newer) this.copyValue(r.newer, option.data);
                if (r.older) this.copyValue(r.older, option.data);
            });
        }
    }

    doCompareObject(newer, older, option) {
        _forEach(option, property => {
            if (!newer && !older) {
                property.match = true;
                property.newer = '';
                property.older = '';
                return;
            }
            let l = '';
            if (newer) l = _get(newer, property.property);
            let r = '';
            if (older) r = _get(older, property.property);
            if (!property.data) {
                property.match = _isEqual(l, r);
                property.newer = l ? l.toString() : '';
                property.older = r ? r.toString() : '';
                if (!newer && !older) {
                    property.display = false;
                    property.match = true;
                }
            } else {
                this.doCompareObject(l, r, property.data);
                if (property.data) property.match = !(property.data.filter(p => !p.match).length > 0);
            }
        });
        return option;
    }
}
