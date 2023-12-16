import { ExcelValue, trim, WithError } from 'shared/node/io/excel';
import { DataElement } from 'shared/de/dataElement.model';

export interface ColumnInformation {
    order: number
    required: boolean,
    value: ExcelValue | null,
    setValue: (withError: WithError, de: Partial<DataElement>, v: ExcelValue, info: RowInformation) => void,
}

export interface RowInformation {
    bundled?: boolean;
    bundleName?: string;
}

export function arrayMismatch(withError: WithError, leftArray: Array<any>, rightArray: Array<any>, leftLabel: string, rightLabel: string) {
    withError('Length', `There are ${leftArray.length} ${leftLabel} but ${rightArray.length} ${rightLabel}. Must be the same count.`);
    if (leftArray.length > rightArray.length) {
        if (!leftArray.slice(-1)[0]) {
            withError('Length', `${leftLabel} may have a trailing | that was not intended.`);
        }
    } else if (rightArray.length > leftArray.length) {
        if (!rightArray.slice(-1)[0]) {
            withError('Length', `${rightLabel} may have a trailing | that was not intended.`);
        }
    }
}

export function valueAsString(v: ExcelValue): string {
    return v ? trim(v + '') : '';
}

export function valueToArray(value: string, len: number = -1): string[] {
    const valueArray = value.split('|');
    if (valueArray.length === 1 && len > 1) {
        valueArray.length = len;
        valueArray.fill(valueArray[0]);
    }
    valueArray.forEach((value, index, array) => {
        array[index] = trim(value);
    });
    return valueArray;
}
