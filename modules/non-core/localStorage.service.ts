import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
    setItem(key: any, value: any) {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
    }

    getItem(key: any) {
        const value = localStorage.getItem(key);
        if (!value) {
            return '';
        } else {
            const type = typeof value;
            if (type === 'object') {
                return JSON.parse(value);
            } else {
                return value;
            }
        }
    }
}
