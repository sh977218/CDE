import { Cb1, Cb2 } from 'shared/models.model';

export function joinCb<A, B>(fnA: Cb1<A>, fnB: Cb1<B>, fnAB: Cb2<A, B>): {cbA: Cb1<A>, cbB: Cb1<B>} {
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
