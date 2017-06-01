import { Injectable, Pipe, PipeTransform } from "@angular/core";

@Injectable()
@Pipe({name: "compareKeys", pure: false})
export class CompareKeysPipe implements PipeTransform {
    transform(value: any, args: any[] = null): any {
        let keys = [];
        for (let key in value) {
            if (key.toLowerCase() !== "match")
                keys.push(key);
        }
        return keys;
    }
}