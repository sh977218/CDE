// ES6 Maps are safer and easier under some circumstances over dictionaries {}
// if creating a dictionary via safer Object.create(null), then should probably use Map
// use for object literal constructor only, otherwise use Map

import { keys } from 'shared/builtIn';

export function filter<A extends string | number | symbol, B>(
    dictionary: Record<A, B>,
    iterate: (a: A, b: B) => boolean
): A[] {
    return keys(dictionary).filter(key => iterate(key, dictionary[key]));
}

export function forEach<A extends string | number | symbol, B>(
    dictionary: Record<A, B>,
    iterate: (a: A, b: B) => void
) {
    keys(dictionary).forEach(key => iterate(key, dictionary[key]));
}

export function map<A extends string | number | symbol, B, C>(dictionary: Record<A, B>, iterate: (a: A, b: B) => C) {
    return keys(dictionary).map(key => iterate(key, dictionary[key]));
}
