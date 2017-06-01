import { Injectable } from "@angular/core";
import * as _ from "lodash";

@Injectable()
export class CompareService {

    doCompareObject(left, right, option) {
        _.forEach(option, (property) => {
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
                if (property.data) property.match = property.data.filter(p => p.match).length > 0;
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

    doCompareArray(left, right, option) {
        let result = [];
        CompareService.doCompareArrayValidator(left, right, option);
        let matchCount = 0;
        let beginIndex = 0;

        _.forEach(left, (value, leftIndex) => {
            let rightArrayCopy = _.slice(right, beginIndex);
            let leftItemInRightArrayIndex = _.findIndex(rightArrayCopy, o => option.equal(o, value));
            if (leftItemInRightArrayIndex === -1) {
                // put all right list elements before this element
                if (beginIndex === left.length - 1) {
                    for (let m = 0; m < left.length; m++) {
                        result.push({
                            found: "right",
                            rightIndex: m,
                            result: _.cloneDeep(option.properties)
                        });
                        beginIndex++;
                    }
                }
                // put this element not found
                result.push({
                    found: 'left',
                    leftIndex: leftIndex,
                    result: _.cloneDeep(option.properties)
                });
            } else {
                // put all right elements before matched element
                let beginIndexCopy = beginIndex;
                for (let k = 0; k < leftItemInRightArrayIndex; k++) {
                    result.push({
                        found: "right",
                        rightIndex: beginIndex + leftItemInRightArrayIndex - 1
                    });
                    beginIndex++;
                }
                // put this element found
                let found = {
                    match: true,
                    leftIndex: leftIndex,
                    rightIndex: beginIndexCopy + leftItemInRightArrayIndex
                };
                let rightIndexCopy = beginIndexCopy + leftItemInRightArrayIndex;
                found["result"] = this.doCompare(left[leftIndex], right[rightIndexCopy], option["properties"]);
                result.push(found);
                matchCount++;
                beginIndex++;
            }
        });
        // if after looping left list, there are element in the right list, put all of them
        for (let i = beginIndex; i < right.length; i++)
            result.push({
                found: "right",
                rightIndex: i,
                result: _.cloneDeep(option.properties)
            })
        return result;
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

    doCompare(left, right, option) {
        CompareService.doCompareValidator(left, right, option);
        if (!left || !right) return {match: false, left: left, right: right};
        let result = {};
        if (option.array)
            result = this.doCompareArray(left, right, option["properties"]);
        else
            result = this.doCompareObject(left, right, option);
        return result;
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

    getValueByNestedProperty(obj, propertyString) {
        if (!obj) return "";
        // convert indexes to properties and strip a leading dot
        propertyString = propertyString.replace(/\[(\w+)]/g, '.$1').replace(/^\./, '');
        var propertyArray = propertyString.split('.');
        for (var i = 0, n = propertyArray.length; i < n; ++i) {
            var k = propertyArray[i];
            if (k in obj) obj = obj[k];
            else return;
        }
        return obj;
    }

}

