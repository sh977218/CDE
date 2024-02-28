import { HttpErrorResponse } from '@angular/common/http';
import { Params } from '@angular/router';
import { ownKeys } from 'shared/util';

export function httpErrorMessage(err: HttpErrorResponse): string {
    if (typeof err.error === 'string') {
        return err.error; // response body
    }
    if (err.error instanceof Error) {
        return err.error.message; // legacy server error objects
    }
    if (err.message === 'Http failure response for (unknown url): 0 Unknown Error') {
        return 'Server is not available or you are offline.';
    }
    if (err.status === 401) {
        return 'Unauthenticated. Please login.'; // Unauthorized
    }
    if (err.status === 403) {
        return 'Forbidden. Please request permission from your NIH point of contact.';
    }
    if (err.status === 409) {
        return 'Conflict. Already Exists';
    }
    if (err.statusText) {
        return err.statusText; // general status codes
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
