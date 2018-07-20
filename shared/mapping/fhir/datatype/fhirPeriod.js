import { CdeForm } from 'shared/form/form.model';

export function newPeriod(start, end = undefined) {
    if (!end) {
        return {start: start, end: start};
    } else {
        return {start: start, end: end};
    }
}
