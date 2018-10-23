exports.mergeBySourceName = (existingArray, newArray) => {
    let otherArray = existingArray.filter(o => o.sourceName !== 'LOINC');
    return newArray.concat(otherArray);
};
