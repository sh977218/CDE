import { HttpErrorResponse } from '@angular/common/http';
import { Params } from '@angular/router';
import { ownKeys } from 'shared/util';

export function httpErrorMessage(err: HttpErrorResponse): string {
    if (typeof err.error === 'string') {
        // response body
        return err.error;
    }
    if (err.error instanceof Error) {
        // legacy server error objects
        return err.error.message;
    }
    if (err.message === 'Http failure response for (unknown url): 0 Unknown Error') {
        return 'Server is not available or you are offline.';
    }
    if (err.statusText) {
        // general status codes
        return err.statusText;
    }
    return err.message; // fallback to full angular http description
}

export function paramsToQueryString(params: Params) {
    const query = ownKeys(params)
        .map(k => k + '=' + params[k])
        .join(';');
    return query ? '?' + query : '';
}

export function trackByKey(index: number, item: any): string {
    return item.key;
}

export function trackByName(index: number, item: any): string {
    return item.name;
}
