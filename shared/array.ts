import { CbRet3 } from 'shared/models.model';

export function partition<T>(arr: T[], condition: CbRet3<boolean, T, number, T[]>): [T[], T[]] {
    return arr.reduce((result: [T[], T[]], e: T, i: number, arr: T[]) => {
        condition(e, i, arr)
            ? result[0].push(e)
            : result[1].push(e);

        return result;
    }, [[], []]);
}

export function push2<T>(array: T[], ...element: T[]): T[] {
    array.push(...element);
    return array;
}

export function range(num: number): number[] { // 0..num-1
    return Array.apply(null, Array(num)).map((dummy: any, i: number) => i);
}

export function reduce<T, U>(arr: U[] | undefined, cb: (a: T, c: U) => T, initialValue: T): T {
    return Array.isArray(arr) ? arr.reduce<T>(cb, initialValue) : initialValue;
}
