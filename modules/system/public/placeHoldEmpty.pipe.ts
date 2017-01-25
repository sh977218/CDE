import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'placeholder'})
export class PlaceHoldEmptyPipe implements PipeTransform {
    transform(input: number) {
        if (input === undefined || input === null || isNaN(input))
            return "N/A";
        else
            return input;
    }
}
