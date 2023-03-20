import { CbRet3 } from 'shared/models.model';

export function addOrRemoveFromArray<T>(arr: T[], elem: T): void {
    const index = arr.indexOf(elem);
    if (index > -1) {
        arr.splice(index, 1);
    } else {
        arr.push(elem);
    }
}

export function addToArray<T>(arr: T[], elem: T): boolean {
    const index = arr.indexOf(elem);
    if (index === -1) {
        arr.push(elem);
        return true;
    }
    return false;
}

export function concat<T>(...lists: T[][]): T[] { // concat [] with type, T[] run-time=null-protected compile-time=strict
    return ([] as T[]).concat(...lists.filter(arr => Array.isArray(arr)));
}

export function cumulative<T, U>(array: U[],
                                 mappingFn: (previousValue: T, currentValue: U, currentIndex: number, array: U[]) => T,
                                 initialValue : T
) { // reduce that creates an array instead of value
    let accumulator = initialValue;
    return array.map((a, i, array) => accumulator = mappingFn(accumulator, a, i, array));
}

export function deduplicate<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

export function orderedSetAdd<T>(arr: T[], elem: T): void {
    if (!arr.includes(elem)) {
        arr.push(elem);
    }
}

export function partition<T>(arr: T[], condition: CbRet3<boolean, T, number, T[]>): [T[], T[]] { // filtered and excluded lists
    return arr.reduce((result: [T[], T[]], e: T, i: number, arr: T[]) => {
        condition(e, i, arr)
            ? result[0].push(e)
            : result[1].push(e);

        return result;
    }, [[], []]);
}

export function push2<T>(array: T[], ...element: T[]): T[] { // push that returns
    array.push(...element);
    return array;
}

export function range(num: number): number[] { // 0..num-1
    return Array.apply(null, Array(num)).map((dummy: any, i: number) => i);
}

export function reduce<T, U>(arr: U[] | undefined, cb: (a: T, c: U) => T, initialValue: T): T { // reduce with optional array
    return Array.isArray(arr) ? arr.reduce<T>(cb, initialValue) : initialValue;
}

export function removeFromArray<T>(arr: T[], elem: T): T | undefined {
    const index = arr.indexOf(elem);
    if (index === -1) {
        return;
    }
    return arr.splice(index, 1)[0];
}

export function removeFromArrayBy<T>(arr: T[], iterCb: CbRet3<boolean, T, number, T[]>): T | undefined {
    const index = arr.findIndex(iterCb);
    if (index === -1) {
        return;
    }
    return arr.splice(index, 1)[0];
}

export function sortFirst<T>(arr: T[], condition: CbRet3<boolean, T, number, T[]>) {
    return concat(...partition(arr, condition));
}
