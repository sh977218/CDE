import { Pipe, PipeTransform } from '@angular/core';
const decamelize = require('decamelize');

@Pipe({name: 'cdeCamelCaseToHuman'})
export class CamelCaseToHumanPipe implements PipeTransform {

    decamelize (str, sep) {
        if (typeof str !== 'string') {
            throw new TypeError('Expected a string');
        }

        sep = typeof sep === 'undefined' ? '_' : sep;

        return str
            .replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
            .toLowerCase();
    }

    transform(value: string, args: boolean): string {
        if (typeof(value) !== "string") return value;
        let result = decamelize(value, ' ');
        if (args) result = result.charAt(0).toUpperCase() + result.slice(1);
        return result;

    }
}