import { HttpErrorResponse } from '@angular/common/http';

export function httpErrorMessage(err: any) {
    if (!err) {
        return '';
    }
    if (err.error instanceof Error) { // client-side
        return err.error.message;
    } else if (typeof(err.error) === 'string') { // server-side
        return err.error;
    } else if (err instanceof HttpErrorResponse) {
        if (err.message === 'Http failure response for (unknown url): 0 Unknown Error') {
            return 'Server is not available or you are offline.';
        }
        return err.message;
    }
}

export function trackByKey(index: number, item: any): string {
    return item.key;
}

export function trackByName(index: number, item: any): string {
    return item.name;
}