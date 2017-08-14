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
/*
    swapIndex(result2) {
        result2.result.forEach(function (r) {
            var leftIndexCopy;
            var rightIndexCopy;
            if (r.leftIndex != undefined) {
                leftIndexCopy = _.cloneDeep(r.leftIndex);
            }
            if (r.rightIndex != undefined) {
                rightIndexCopy = _.cloneDeep(r.rightIndex);
            }
            delete r.leftIndex;
            delete r.rightIndex;
            if (rightIndexCopy != undefined)
                r.leftIndex = rightIndexCopy;
            if (leftIndexCopy != undefined)
                r.rightIndex = leftIndexCopy;
            if (r.found !== 'both') {
                r.found = r.found === 'right' ? 'left' : 'right';
            }
        });
    }

    compareImpl(l, r, options) {
        if (options.type === 'array') {
            return compareShared.compareSideBySide.arrayCompare(l, r, options);
        } else if (options.type === 'object') {
            return compareShared.compareSideBySide.objectCompare(l, r, options);
        } else if (options.type === 'string') {
            return compareShared.compareSideBySide.stringCompare(l, r, options);
        } else if (options.type === 'number') {
            return compareShared.compareSideBySide.numberCompare(l, r, options);
        }
    }


    arrayCompare(leftArray, rightArray, options) {
        var matchCount = 0;
        var result = [];
        var leftIndex = 0;
        var beginIndex = 0;

        if (!options) options = {};
        if (!options.equal) {
            options.equal = function (a, b) {
                return JSON.stringify(a) === JSON.stringify(b);
            }
        }
        if (options.sort) {
            leftArray.sort(options.sort);
            rightArray.sort(options.sort);
        }
        if (!options.properties) options.properties = exports.getProperties(leftArray[0], rightArray[0]);
        leftArray.forEach(function (o) {
                if (options.wipeUseless) {
                    options.wipeUseless(o);
                }
                var rightArrayCopy = rightArray.slice(beginIndex, rightArray.length);
                var rightIndex = exports.findIndexInArray(rightArrayCopy, o, options.equal);
                // element didn't found in right list.
                if (rightIndex === -1) {
                    // put all right list elements before this element
                    if (beginIndex === leftArray.length - 1) {
                        for (var m = 0; m < rightArray.length; m++) {
                            result.push({
                                found: "right",
                                rightIndex: m,
                                result: exports.copyProperties(options.properties)
                            });
                            beginIndex++;
                        }
                    }
                    // put this element not found
                    result.push({
                        found: 'left',
                        leftIndex: leftIndex,
                        result: exports.copyProperties(options.properties)
                    });
                }
                // element found in right list
                else {
                    // put all right elements before matched element
                    var beginIndexCopy = beginIndex;
                    for (var k = 0; k < rightIndex; k++) {
                        result.push({
                            found: "right",
                            rightIndex: beginIndex + rightIndex - 1,
                            result: exports.copyProperties(options.properties)
                        });
                        beginIndex++;
                    }
                    // put this element found
                    var found = {
                        found: "both",
                        leftIndex: leftIndex,
                        rightIndex: beginIndexCopy + rightIndex,
                        result: []
                    };
                    options.properties.forEach(function (p) {
                        var property = exports.deepCopy(p);
                        if (!property.label) property.label = property.property;
                        property.match = JSON.stringify(getValueByNestedProperty(leftArray[found.leftIndex], property.property))
                            === JSON.stringify(getValueByNestedProperty(rightArray[found.rightIndex], property.property));
                        found.result.push(property);
                        if (!property.match)
                            found.notMatch = true;
                    });
                    result.push(found);
                    matchCount++;
                    beginIndex++;
                }
                leftIndex++;
            }
        );
        // if after looping left list, there are element in the right list, put all of them
        for (var i = beginIndex; i < rightArray.length; i++)
            result.push({
                found: "right",
                rightIndex: i,
                result: exports.copyProperties(options.properties)
            })
        return {result: result, matchCount: matchCount};
    }

    objectCompare(leftObj, rightObj, options) {
        if (options.wipeUseless) {
            options.wipeUseless(leftObj);
            options.wipeUseless(rightObj);
        }
        var result = [];
        var matchCount = 0;
        if (!options) options = {};
        if (!options.properties) {
            options.properties = exports.getProperties(leftObj, rightObj);
        }
        options.properties.forEach(function (p) {
            var property = exports.deepCopy(p);
            if (!property.label) property.label = property.property;
            if (getValueByNestedProperty(leftObj, property.property) === getValueByNestedProperty(rightObj, property.property)) {
                matchCount++;
                property.match = true;
            } else {
                property.match = false;
            }
            result.push(property);
        });
        return {result: result, matchCount: matchCount};
    }

    stringCompare(leftString, rightString) {
        var matchCount = 0;
        var result = [];
        if (leftString === rightString) {
            matchCount++;
            result.push({
                match: true
            })
        } else {
            result.push({
                match: false
            })
        }
        return {result: result, matchCount: matchCount};
    }

    numberCompare(leftString, rightString) {
        var matchCount = 0;
        var result = [];
        if (leftString === rightString) {
            matchCount++;
            result.push({
                match: true
            })
        } else {
            result.push({
                match: false
            })
        }
        return {result: result, matchCount: matchCount};
    }


    findIndexInArray(array, item, equal) {
        for (var index = 0; index < array.length; index++) {
            if (equal(item, array[index]))
                return index;
        }
        return -1;
    };

    getProperties(leftObj, rightObj) {
        var duplicatedProperties = Object.getOwnPropertyNames(leftObj).concat(Object.getOwnPropertyNames(rightObj));
        return duplicatedProperties.filter(function (item, pos) {
            return duplicatedProperties.indexOf(item) == pos;
        });
    };

    copyProperties(properties) {
        var result = [];
        properties.forEach(function (p) {
            var property = exports.deepCopy(p);
            if (!property.label) property.label = property.property;
            property.match = false;
            result.push(property);
        });
        return result;
    };


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
    }*/
}