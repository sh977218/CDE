import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cdeArrayList', standalone: true })
export class ArrayListPipe implements PipeTransform {
    transform(input: Array<any>) {
        return input.join(', ');
    }
}
