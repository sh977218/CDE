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
                return JSON.stringify(a) === JSON.stringify(b);
            }
        }
        leftArray.forEach(function (o) {
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
                    var beginIndexCopy = beginIndex;
                    for (var k = 0; k < rightIndex; k++) {
                        result.push({
                            action: "space",
                            rightIndex: beginIndex + rightIndex - 1
                        });
                        beginIndex++;
                    }
                    // put this element found
                    var found = {
                        action: "found",
                        leftIndex: leftIndex,
                        rightIndex: beginIndexCopy + rightIndex,
                        result: []
                    };
                    if (!option.properties) option.properties = exports.getProperties(leftArray[0], rightArray[0]);
                    option.properties.forEach(function (p) {
                        var property = exports.deepCopy(p);
                        if (!property.label) property.label = property.property;
                        property.match = JSON.stringify(exports.getValueByNestedProperty(leftArray[leftIndex], property.property))
                        === JSON.stringify(exports.getValueByNestedProperty(rightArray[rightIndex], property.property));
                        found.result.push(property);
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
                action: "space",
                rightIndex: i
            })
        return {result: result, matchCount: matchCount};

    },
    objectCompare: function (leftObj, rightObj, option) {
        exports.wipeUseless(leftObj);
        exports.wipeUseless(rightObj);
        var result = [];
        var matchCount = 0;
        if (!option) option = {};
        if (!option.properties) {
            option.properties = exports.getProperties(leftObj, rightObj);
        }
        option.properties.forEach(function (p) {
            var property = exports.deepCopy(p);
            if (!property.label) property.label = property.property;
            if (exports.getValueByNestedProperty(leftObj, property.property) === exports.getValueByNestedProperty(rightObj, property.property)) {
                matchCount++;
                property.match = true;
            } else {
                property.match = false;
            }
            result.push(property);
        });
        return {result: result, matchCount: matchCount};
    }

    ,
    stringCompare: function (leftString, rightString) {
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
    numberCompare: function (leftString, rightString) {
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
    propertyString = propertyString.replace(/\[(\w+)]/g, '.$1').replace(/^\./, '');
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
    delete obj._id;
    delete obj.__v;
    delete obj.history;
    delete obj.imported;
    delete obj.noRenderAllowed;
    delete obj.displayProfiles;
    delete obj.attachments;
    delete obj.version;
    delete obj.comments;
    delete obj.derivationRules;
    delete obj.usedBy;
    delete obj.classification;
    delete obj.$$hashKey;
    delete obj.isOpen;
    delete obj.formElements;
    if (obj.questions) {
        obj.questions.forEach(function (question) {
            delete question._id;
        })
    }
};

exports.findIndexInArray = function (array, item, equal) {
    for (var index = 0; index < array.length; index++) {
        if (equal(item, array[index])) return index;
    }
    return -1;
};
exports.getProperties = function (leftObj, rightObj) {
    var duplicatedProperties = Object.getOwnPropertyNames(leftObj).concat(Object.getOwnPropertyNames(rightObj));
    return duplicatedProperties.filter(function (item, pos) {
        return duplicatedProperties.indexOf(item) == pos;
    });
};
exports.deepCopy = function (o) {
    return JSON.parse(JSON.stringify(o));
};
