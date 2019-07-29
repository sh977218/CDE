import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'cdePlaceholder'})
export class PlaceHoldEmptyPipe implements PipeTransform {
    transform(input: string) {
        if (input === undefined || input === null || input === 'NaN' || input === '') { return 'N/A'; }
        else { return input; }
    }
}
