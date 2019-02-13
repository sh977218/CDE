import _find from 'lodash/find';

export function capCase(str) {
    return str.split(' ').map(capString).join(' ');
}

// capitalize first letter only
export function capString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function decamelize(str) {
    let result = str
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
        .toLowerCase();
    return capString(result);
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

export function push2(arr, e) {
    arr.push(e);
    return arr;
}

export function reduceOptionalArray(arr, cb, initialValue) {
    return Array.isArray(arr) ? arr.reduce(cb, initialValue) : initialValue;
}

export function stringCompare(a, b) {
    return a > b ? 1 : (a < b ? -1 : 0);
}
