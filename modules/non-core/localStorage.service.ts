import { Injectable } from '@angular/core';

type Value = any;

@Injectable()
export class LocalStorageService {
    setItem(key: string, value: Value) {
        localStorage.setItem(
            prefix(key),
            typeof value === 'object' ? JSON.stringify(value) : value
        );
    }

    getItem(key: string): Value {
        const value = localStorage.getItem(prefix(key));
        if (!value) {
            return '';
        }
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
}

function prefix(key: string): string {
    return 'nlmcde.' + key;
}
