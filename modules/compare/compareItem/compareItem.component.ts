import { Component, Input, OnInit } from '@angular/core';
import { flattenClassification } from 'core/adminItem/classification';
import { forEach, get, isEqual } from 'lodash';
import { sortClassification } from 'shared/classification/classificationShared';
import { Item } from 'shared/item';

@Component({
    selector: 'cde-compare-item',
    templateUrl: './compareItem.component.html',
})
export class CompareItemComponent implements OnInit {
    @Input() older!: Item;
    @Input() newer!: Item;
    @Input() filter!: {
        add: { select: any };
        edited: { select: any };
        remove: { select: any };
        reorder: { select: any };
    };
    newerFlatClassifications!: string;
    olderFlatClassifications!: string;
    map = {
        Text: 'valueDomain.datatypeText',
    };
    compareObjectProperties = [
        { label: 'isCopyrighted', match: false, property: 'isCopyrighted' },
        { label: 'noRenderAllowed', match: false, property: 'noRenderAllowed' },
        { label: 'Steward Org', match: false, property: 'stewardOrg.name' },
        { label: 'Version', match: false, property: 'version' },
        { label: 'Registration Status', match: false, property: 'registrationState.registrationStatus' },
        { label: 'Administrative Status', match: false, property: 'registrationState.administrativeStatus' },
        { label: 'Unit of Measure', match: false, property: 'valueDomain.uom' },
        { label: 'Data Type', match: false, property: 'valueDomain.datatype' },
        {
            label: 'Data Type Text',
            match: false,
            property: 'valueDomain.datatypeText',
            data: [
                { label: 'Data Type Text Minimal Length', match: false, property: 'minLength' },
                { label: 'Data Type Text Maximal Length', match: false, property: 'maxLength' },
                { label: 'Data Type Text Regex', match: false, property: 'regex' },
                { label: 'Data Type Text Rule', match: false, property: 'rule' },
            ],
        },
        {
            label: 'Data Type Number',
            match: false,
            property: 'valueDomain.datatypeNumber',
            data: [
                { label: 'Data Type Number Minimal Value', match: false, property: 'minValue' },
                { label: 'Data Type Number Maximal Value', match: false, property: 'maxValue' },
                { label: 'Data Type Number Precision', match: false, property: 'precision' },
            ],
        },
        {
            label: 'Data Type Date',
            match: false,
            property: 'valueDomain.datatypeDate',
            data: [{ label: 'Data Type Date Precision', match: false, property: 'precision' }],
        },
        {
            label: 'Data Type Time',
            match: false,
            property: 'valueDomain.datatypeTime',
            data: [{ label: 'Data Type Time Format', match: false, property: 'format' }],
        },
    ];

    ngOnInit(): void {
        this.newerFlatClassifications = flattenClassification(sortClassification(this.newer)).join(',');
        this.olderFlatClassifications = flattenClassification(sortClassification(this.older)).join(',');
        doCompareObject(this.older, this.newer, this.compareObjectProperties);
    }
}

function doCompareObject(newer: any, older: any, option: any) {
    forEach(option, (property: any) => {
        if (!newer && !older) {
            property.match = true;
            property.newer = '';
            property.older = '';
            return;
        }
        const l = newer ? get(newer, property.property) : '';
        const r = older ? get(older, property.property) : '';
        if (property.data) {
            doCompareObject(l, r, property.data);
            if (property.data) {
                property.match = !property.data.some((p: any) => !p.match);
            }
        } else {
            property.match = isEqual(l, r);
            property.newer = l ? l.toString() : '';
            property.older = r ? r.toString() : '';
            if (!newer && !older) {
                property.match = true;
            }
        }
    });
    return option;
}
