import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'cdePlaceholder'})
export class PlaceHoldEmptyPipe implements PipeTransform {
    transform(input: string) {
        return input === undefined || input === null || input === 'NaN' || input === ''
            ? 'N/A'
            : input;
    }
}
