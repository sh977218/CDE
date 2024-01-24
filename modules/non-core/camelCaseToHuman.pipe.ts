import { Pipe, PipeTransform } from '@angular/core';
import { capitalize, decamelize } from 'shared/util';

@Pipe({ name: 'cdeCamelCaseToHuman', standalone: true })
export class CamelCaseToHumanPipe implements PipeTransform {
    transform(value: string, args?: boolean): string {
        if (typeof value !== 'string') {
            return value;
        }
        return args ? capitalize(decamelize(value)) : decamelize(value);
    }
}
