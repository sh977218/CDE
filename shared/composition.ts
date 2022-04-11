import { curry, curryRight } from 'lodash';

export type CurriedFunction = (x: any) => any;
export const compose = (...fns: CurriedFunction[]) => (x: CurriedFunction) => fns.reduceRight((y, f) => f(y), x);
export const pipe = (...fns: CurriedFunction[]) => (x: CurriedFunction) => fns.reduce((y, f) => f(y), x);

export function flip<T, U, V>(fn: (t: T) => (u: U) => V) {
    return (u: U) => (t: T) => fn(t)(u);
}
