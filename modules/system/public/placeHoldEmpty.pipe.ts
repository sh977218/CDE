import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'placeholder'})
export class PlaceHoldEmptyPipe implements PipeTransform {
    transform(input: string) {
        if (input === undefined || input === null || input === "NaN")
            return "N/A";
        else
            return input;
    }
}
