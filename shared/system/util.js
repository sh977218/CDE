import _find from 'lodash/find';

// capitalize first letter only
export function capString(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export const callbackToData = (err, data) => {
        cb(err ? undefined : data);
};

export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function reduceOptionalArray(arr, cb, initialValue) {
    return Array.isArray(arr) ? arr.reduce(cb, initialValue) : initialValue;
}

export function stringCompare(a, b) {
    return a > b ? 1 : (a < b ? -1 : 0);
}
