export function mergeBySource(existingArray, newArray) {
    let otherArray = existingArray.filter(o => o.source !== 'LOINC');
    return newArray.concat(otherArray);
}