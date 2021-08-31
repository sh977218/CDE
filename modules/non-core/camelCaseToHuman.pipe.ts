import { Pipe, PipeTransform } from '@angular/core';
import { capString, decamelize } from 'shared/util';

@Pipe({name: 'cdeCamelCaseToHuman'})
export class CamelCaseToHumanPipe implements PipeTransform {
    transform(value: string, args?: boolean): string {
        if (typeof(value) !== 'string') {
            return value;
        }
        return args
            ? capString(decamelize(value))
            : decamelize(value);
    }
}
