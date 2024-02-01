import { Cb1, Cb2 } from 'shared/models.model';

export function joinCb<A, B>(fnA: Cb1<A>, fnB: Cb1<B>, fnAB: Cb2<A, B>): { cbA: Cb1<A>; cbB: Cb1<B> } {
    let a: A;
    let aReceived: boolean = false;
    let b: B;
    let bReceived: boolean = false;
    return {
        cbA: (input: A) => {
            a = input;
            aReceived = true;
            fnA(a);
            if (bReceived) {
                fnAB(a, b);
            }
        },
        cbB: (input: B) => {
            b = input;
            bReceived = true;
            fnB(b);
            if (aReceived) {
                fnAB(a, b);
            }
        },
    };
}

export function matchLatest<A, B, C>(
    cbAll: (a: A, b: B) => C
): {
    cbA: (a: A) => Promise<C>;
    cbB: (b: B) => Promise<C>;
} {
    let a: A;
    let aResolve: Cb1<C> | null = null;
    let b: B;
    let bResolve: Cb1<C> | null = null;

    function run(rA: Cb1<C>, rB: Cb1<C>) {
        const c = cbAll(a, b);
        rA(c);
        rB(c);
        aResolve = null;
        bResolve = null;
    }

    return {
        cbA: aIn => {
            a = aIn;
            return new Promise<C>(resolve => {
                aResolve = resolve;
                if (bResolve) {
                    run(aResolve, bResolve);
                }
            });
        },
        cbB: bIn => {
            b = bIn;
            return new Promise<C>(resolve => {
                bResolve = resolve;
                if (aResolve) {
                    run(aResolve, bResolve);
                }
            });
        },
    };
}
