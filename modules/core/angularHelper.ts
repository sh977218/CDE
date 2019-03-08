import { HttpErrorResponse } from '@angular/common/http';
import { Params } from '@angular/router';

export function httpErrorMessage(err: any): string {
    if (!err) {
        return '';
    }
    if (err.error instanceof Error) { // client-side
        return err.error.message;
    } else if (typeof(err.error) === 'string') { // server-side
        return err.error;
    } else if (err instanceof HttpErrorResponse) { // angular
        if (err.message === 'Http failure response for (unknown url): 0 Unknown Error') {
            return 'Server is not available or you are offline.';
        }
        return err.message;
    } else {
        return 'Unknown Error';
    }
}

export function paramsToQueryString(params: Params) {
    let query = Object.keys(params)
        .filter(k => params.hasOwnProperty(k))
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
