import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "cdeArrayList"})
export class ArrayListPipe implements PipeTransform {
    transform(input: Array<any>) {
        return input.map(function (m) {
            return m.tag;
        }).join(", ");
    }
}