exports.mergeBySourceName = (existingArray, newArray) => {
    if (existingArray) {
        let otherArray = existingArray.filter(o => o.sourceName !== 'LOINC');
        return newArray.concat(otherArray);
    }
    else return [];
};
