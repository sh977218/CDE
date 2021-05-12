// @ts-ignore
import * as _curry from 'lodash/curry';
export const curry = _curry;
// @ts-ignore
import * as _curryRight from 'lodash/curryRight';
export const curryRight = _curryRight

export type CurriedFunction = (x: any) => any;
export const compose = (...fns: CurriedFunction[]) => (x: CurriedFunction) => fns.reduceRight((y, f) => f(y), x);
export const pipe = (...fns: CurriedFunction[]) => (x: CurriedFunction) => fns.reduce((y, f) => f(y), x);

export function flip<T, U, V>(fn: (t: T) => (u: U) => V) {
    return (u: U) => (t: T) => fn(t)(u);
}
