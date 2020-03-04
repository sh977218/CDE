import { Injectable } from '@angular/core';

const PREFIX = 'nlmcde.';

@Injectable()
export class LocalStorageService {
    setItem(key: any, value: any) {
        const valueStringify = typeof  value === 'object' ?
            JSON.stringify(value) : value;
        localStorage.setItem(PREFIX +  key, valueStringify);
    }

    getItem(key: any) {
        const value = localStorage.getItem(PREFIX + key);
        if (!value) {
            return '';
        } else {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
    }
}
