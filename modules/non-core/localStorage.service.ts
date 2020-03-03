import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
    setItem(key: any, value: any) {
        const valueStringify = JSON.stringify(value);
        localStorage.setItem(key, valueStringify);
    }

    getItem(key: any) {
        const value = localStorage.getItem(key);
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
