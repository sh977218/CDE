import _find from 'lodash/find';

export function capCase(str) {
    return str.split(' ').map(capString).join(' ');
}

// capitalize first letter only
export function capString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function decamelize(str, sep = ' ') {
    const outFormat = '$1' + sep + '$2';
    return str
        .replace(/([a-z\d])([A-Z])/g, outFormat)
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, outFormat)
        .toLowerCase();
}

export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function partition(arr, condition) {
    return arr.reduce((result, e, i, arr) => {
        condition(e, i, arr)
            ? result[0].push(e)
            : result[1].push(e);

        return result;
    }, [[], []]);
}

export function push2(arr, ...e) {
    arr.push(...e);
    return arr;
}

export function range(num) {
    return Array.apply(null, Array(num)).map((_, i) => i);
}

export function reduceOptionalArray(arr, cb, initialValue) {
    return Array.isArray(arr) ? arr.reduce(cb, initialValue) : initialValue;
}

export function stringCompare(a, b) {
    return a > b ? 1 : (a < b ? -1 : 0);
}
