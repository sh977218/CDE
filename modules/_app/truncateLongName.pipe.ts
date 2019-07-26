import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'cdeTruncateLongName'})
export class TruncateLongNamePipe implements PipeTransform {
    transform(input: string) {
        if (input === undefined || input === null || input === '') { return 'N/A'; }
        if (input.length > 17) { return input.substr(0, 17) + '...'; }
        return input;
    }
}
