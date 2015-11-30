if (typeof(exports) === "undefined") exports = {};

exports.compareSideBySide = {
    arrayCompare: function (leftArray, rightArray, option) {
        var matchCount = 0;
        var result = [];
        var leftIndex = 0;
        var beginIndex = 0;

        if (!option) option = {};
        if (!option.equal) {
            option.equal = function (a, b) {
                if (JSON.stringify(a) === JSON.stringify(b)) return true;
                else return false;
            }
        }
        leftArray.forEach(function (o) {
                exports.wipeUseless(o);
                var rightIndex = exports.findIndexInArray(rightArray.slice(beginIndex, rightArray.length), o, option.equal);
                // element didn't found in right list.
                if (rightIndex === -1) {
                    // put all right list elements before this element
                    if (beginIndex === 0) {
                        for (var m = 0; m < rightArray.length; m++) {
                            result.push({
                                action: "space",
                                rightIndex: m
                            });
                            beginIndex++;
                        }
                    }
                    // put this element not found
                    result.push({
                        action: "not found",
                        leftIndex: leftIndex
                    });
                }
                // element found in right list
                else {
                    // put all right elements before matched element
                    var _beginIndex = beginIndex;
                    for (var k = 0; k < rightIndex; k++) {
                        result.push({
                            action: "space",
                            rightIndex: beginIndex + rightIndex - 1
                        });
                        beginIndex++;
                    }
                    // put this element found
                    var temp = {
                        action: "found",
                        leftIndex: leftIndex,
                        rightIndex: _beginIndex + rightIndex
                    };
                    var resultObj = [];
                    if (!option.properties) option.properties = exports.getProperties(leftArray[0], rightArray[0]);
                    option.properties.forEach(function (p) {
                        if (JSON.stringify(exports.getValueByNestedProperty(leftArray[leftIndex], p.property))
                            === JSON.stringify(exports.getValueByNestedProperty(rightArray[rightIndex], p.property))) {
                            p.match = true;
                        } else p.match = false;
                        resultObj.push(p);
                    });
                    temp.result = resultObj;
                    result.push(temp);
                    matchCount++;
                    beginIndex++;
                }
                leftIndex++;
            }
        )
        ;
        // if after looping left list, there are element in the right list, put all of them
        for (var i = beginIndex; i < rightArray.length; i++)
            result.push({
                action: "space",
                rightIndex: i
            })
        return {result: result, matchCount: matchCount};

    },
    objectCompare: function (leftObj, rightObj, option) {
        var result = [];
        var matchCount = 0;
        if (!option) option = {};
        if (!option.properties) {
            option.properties = exports.getProperties(leftObj, rightObj);
        }
        option.properties.forEach(function (property) {
            var p = {label: property, property: property};
            if (exports.getValueByNestedProperty(leftObj, property) === exports.getValueByNestedProperty(rightObj, property)) {
                matchCount++;
                p.match = true;
            } else {
                p.match = false;
            }
            result.push(p);
        });
        return {result: result, matchCount: matchCount};
    }

    ,
    stringCompare: function (leftString, rightString, option) {
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
    ,
    numberCompare: function (leftString, rightString, option) {
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
};

exports.getValueByNestedProperty = function (obj, propertyString) {
    if (!obj) return "";
    // convert indexes to properties and strip a leading dot
    propertyString = propertyString.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
    var propertyArray = propertyString.split('.');
    for (var i = 0, n = propertyArray.length; i < n; ++i) {
        var k = propertyArray[i];
        if (k in obj)obj = obj[k];
        else return;
    }
    return obj;
};

exports.wipeUseless = function (obj) {
    delete obj.$$hashKey;
};

exports.findIndexInArray = function (array, item, equal) {
    for (var index = 0; index < array.length; index++) {
        if (equal(item, array[index])) return index;
    }
    return -1;
};
exports.getProperties = function (leftObj, rightObj) {
    var duplicatedProperties = Object.getOwnPropertyNames(leftObj).concat(Object.getOwnPropertyNames(rightObj))
    var properties = duplicatedProperties.filter(function (item, pos) {
        return duplicatedProperties.indexOf(item) == pos;
    })
    return properties;
};