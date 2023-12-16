import { Component, Input } from '@angular/core';
import { Dictionary } from 'async';
import { DataElement } from 'shared/de/dataElement.model';
import { PermissibleValueCodeSystem } from 'shared/models.model';

interface Source {
    source: string;
    termType: 'PT' | 'LA';
    codes: Dictionary<{ code: string; meaning: string }[]>;
    selected: boolean;
    disabled: boolean;
}
const SOURCES: Record<PermissibleValueCodeSystem, Source> = {
    'NCI Thesaurus': {
        source: 'NCI',
        termType: 'PT',
        codes: {},
        selected: false,
        disabled: false,
    },
    UMLS: {
        source: 'UMLS',
        termType: 'PT',
        codes: {},
        selected: false,
        disabled: false,
    },
    LOINC: {
        source: 'LNC',
        termType: 'LA',
        codes: {},
        selected: false,
        disabled: true,
    },
    'SNOMEDCT US': {
        source: 'SNOMEDCT_US',
        termType: 'PT',
        codes: {},
        selected: false,
        disabled: true,
    },
};

@Component({
    selector: 'cde-de-readonly-datatype[elt]',
    templateUrl: './deReadOnlyDataType.component.html',
})
export class DeReadOnlyDataTypeComponent {
    @Input() elt!: DataElement;
    readonly SOURCES: Record<PermissibleValueCodeSystem, Source> = SOURCES;
}
