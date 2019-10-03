import { CbRet, CbRet1 } from 'shared/models.model';

export function arrayFill<T>(size: number, fillFn: CbRet<T>) {
    return Array.apply(null, new Array(size)).map(fillFn);
}

export function capCase(str: string): string {
    return str.split(' ').map(capString).join(' ');
}

// capitalize first letter only
export function capString(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function decamelize(str: string = '', sep: string = ' '): string {
    const outFormat = '$1' + sep + '$2';
    return str
        .replace(/([a-z\d])([A-Z])/g, outFormat)
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, outFormat)
        .toLowerCase();
}

export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function partition<T>(arr: T[], condition: CbRet1<boolean, T, number, T[]>): [T[], T[]] {
    return arr.reduce((result: [T[], T[]], e: T, i: number, arr: T[]) => {
        condition(e, i, arr)
            ? result[0].push(e)
            : result[1].push(e);

        return result;
    }, [[], []]);
}

export function promiseArrayMapSeries<T, U>(array: T[], iterCb: CbRet<Promise<U>, T, number, T[]>): Promise<U[]> {
    return array.reduce(
        (ready, code, i, array) => ready.then(
            results => iterCb(code, i, array).then(result => [...results, result])
        ),
        Promise.resolve<U[]>([])
    );
}

export function promiseDelay<T>(duration: number): () => Promise<T> {
    return (...args: any[]) => new Promise<T>((resolve, reject) => {
        setTimeout(() => {
            resolve(...args);
        }, duration);
    });
}

export function push2<T>(array: T[], ...element: T[]): T[] {
    array.push(...element);
    return array;
}

export function range(num: number): number[] { // 0..num-1
    return Array.apply(null, Array(num)).map((dummy: any, i: number) => i);
}

export function reduceOptionalArray<T, U>(arr: U[], cb: (a: T, c: U) => T, initialValue: T): T {
    return Array.isArray(arr) ? arr.reduce(cb, initialValue) : initialValue;
}

export function stringCompare(a: string, b: string): number {
    return a > b ? 1 : (a < b ? -1 : 0);
}

export function updateTag<T>(array: T[] | undefined, status: boolean, tag: T): T[] {
    if (!array) {
        array = [];
    }
    if (status) {
        if (!array.includes(tag)) {
            array.push(tag);
        }
    } else {
        const index = array.indexOf(tag);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
    return array;
}
