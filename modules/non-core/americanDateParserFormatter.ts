import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { isNumber, toInteger, padNumber } from '@ng-bootstrap/ng-bootstrap/util/util';

export class CdeAmericanDateParserFormatter extends NgbDateParserFormatter {
    parse(value: string): NgbDateStruct {
        if (value) {
            const dateParts = value.trim().split('/');
            if (dateParts.length === 1 && isNumber(dateParts[0])) {
                return {year: toInteger(dateParts[0]), month: 1, day: 1};
            } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
                return {month: toInteger(dateParts[0]), year: toInteger(dateParts[1]), day: 1};
            } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
                return {month: toInteger(dateParts[0]), day: toInteger(dateParts[1]), year: toInteger(dateParts[2])};
            }
        }
        return {year: NaN, month: NaN, day: NaN};
    }

    format(date: NgbDateStruct): string {
        return date ?
            `${isNumber(date.month) ? padNumber(date.month) + '/' : ''}${isNumber(date.day) ? padNumber(date.day) + '/' : ''}${date.year}` :
            '';
    }
}
