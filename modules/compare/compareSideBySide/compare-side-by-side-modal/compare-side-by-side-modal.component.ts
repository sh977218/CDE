import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormElement, FormElementsContainer, QuestionValueList } from 'shared/form/form.model';
import {
    Concept,
    DataElement,
    DatatypeContainerDate,
    DatatypeContainerDynamicList,
    DatatypeContainerExternal,
    DatatypeContainerNumber,
    DatatypeContainerText,
    DatatypeContainerTime,
    DatatypeContainerValueList,
    ValueDomainValueList,
} from 'shared/de/dataElement.model';
import { Cb } from 'shared/models.model';
import { isDataElement, ITEM_MAP } from 'shared/item';
import { forkJoin } from 'rxjs';
import { differenceWith, get, intersectionWith, isArray, isEmpty, isEqual } from 'lodash';
import { copyDeep } from 'shared/util';
import { HttpClient } from '@angular/common/http';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { AlertService } from 'alert/alert.service';
import { CompareItem } from 'compare/compareSideBySide/compare-item';
import { CompareQuestion } from 'compare/compareSideBySide/compare-question';
import { CompareForm } from 'compare/compareSideBySide/compare-form';

interface CompareOption<T> {
    displayAs: {
        data: Data[];
        display?: boolean;
        label: string;
        property: string;
    };
    fullMatches: { left: T; right: T }[];
    fullMatchFn: (a: T, b: T) => boolean;
    leftNotMatches: { left: T; right: T }[];
    notMatchFn: (a: T, b: T) => boolean;
    partialMatches: { left: T; right: T; diff: {} }[];
    partialMatchFn: (a: T, b: T) => string[];
    rightNotMatches: { left: T; right: T }[];
}

interface Data {
    label: string;
    properties?: Data;
    property: string;
    url?: string;
}

@Component({
    templateUrl: './compare-side-by-side-modal.component.html',
    styles: [
        `
            .fullMatch {
                background-color: rgba(223, 240, 216, 0.79);
                margin: 2px 0;
            }

            .partialMatch {
                background-color: rgba(240, 225, 53, 0.79);
                margin: 2px 0;
            }

            .notMatch {
                background-color: rgba(242, 217, 217, 0.5);
                margin: 2px 0;
            }

            ins {
                color: black;
                background: #bbffbb;
            }

            del {
                color: black;
                background: #ffbbbb;
            }
        `,
    ],
})
export class CompareSideBySideModalComponent {
    options: CompareOption<any>[] = [];
    leftUrl?: string;
    rightUrl?: string;
    left?: CompareItem;
    right?: CompareItem;
    canMergeForm = false;
    canMergeDataElement = false;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public isAllowedModel: IsAllowedService,
        @Inject(MAT_DIALOG_DATA) public selectedDEs: CompareItem[] = []
    ) {
        this.doCompare(selectedDEs[0], selectedDEs[1], () => {});
    }

    doneMerge(event: { left: CompareItem; right: CompareItem }) {
        this.doCompare((this.left = event.left), (this.right = event.right), () => {});
    }

    doCompare(l: CompareItem, r: CompareItem, cb: Cb) {
        const leftObservable = this.http.get<CompareItem>(ITEM_MAP[l.elementType].api + l.tinyId);
        const rightObservable = this.http.get<CompareItem>(ITEM_MAP[r.elementType].api + r.tinyId);
        forkJoin([leftObservable, rightObservable]).subscribe(
            results => {
                this.left = results[0] as CompareItem;
                this.right = results[1] as CompareItem;
                if (!isDataElement(this.left)) {
                    this.left.questions = this.flatFormQuestions(this.left);
                }
                if (!isDataElement(this.right)) {
                    this.right.questions = this.flatFormQuestions(this.right);
                }
                this.getOptions(this.left, this.right);
                this.options.forEach(option => {
                    let l = get(this.left, option.displayAs.property);
                    let r = get(this.right, option.displayAs.property);
                    if (!l) {
                        l = [];
                    }
                    if (!r) {
                        r = [];
                    }
                    if (typeof l !== 'object') {
                        l = [{ data: l }];
                    }
                    if (!isArray(l)) {
                        l = [l];
                    }
                    if (typeof r !== 'object') {
                        r = [{ data: r }];
                    }
                    if (!isArray(r)) {
                        r = [r];
                    }
                    intersectionWith(l, r, (a: any, b: any) => {
                        if (option.fullMatchFn(a, b)) {
                            option.displayAs.display = true;
                            option.fullMatches.push({ left: a, right: b });
                            return true;
                        }
                        return false;
                    });
                    intersectionWith(l, r, (a: any, b: any) => {
                        const partialMatchDiff = option.partialMatchFn(a, b);
                        if (partialMatchDiff.length > 0) {
                            option.displayAs.display = true;
                            option.partialMatches.push({ left: a, right: b, diff: partialMatchDiff });
                            return true;
                        }
                        return false;
                    });
                    option.leftNotMatches = differenceWith(l, r, option.notMatchFn);
                    option.rightNotMatches = differenceWith(r, l, option.notMatchFn);
                    if (option.leftNotMatches.length > 0 || option.rightNotMatches.length > 0) {
                        option.displayAs.display = true;
                    }
                });
                cb();
            },
            err => this.alert.httpErrorMessageAlert(err)
        );
    }

    flatFormQuestions(fe: FormElementsContainer): CompareQuestion[] {
        let questions: CompareQuestion[] = [];
        if (fe.formElements) {
            fe.formElements.forEach((e: FormElement) => {
                if (e.elementType && e.elementType === 'question') {
                    e.formElements = [];
                    delete e._id;
                    questions.push(copyDeep(e));
                } else {
                    questions = questions.concat(this.flatFormQuestions(e));
                }
            });
        }
        return questions;
    }

    getOptions(left: CompareItem, right: CompareItem) {
        const commonOption: CompareOption<any>[] = [
            {
                displayAs: {
                    label: 'Steward',
                    property: 'stewardOrg.name',
                    data: [{ label: '', property: 'data' }],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareItem['stewardOrg']['name']>,
            {
                displayAs: {
                    label: 'Status',
                    property: 'registrationState.registrationStatus',
                    data: [{ label: '', property: 'data' }],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareItem['registrationState']['registrationStatus']>,
            {
                displayAs: {
                    label: 'Designation',
                    property: 'designations',
                    data: [
                        { label: 'Designation', property: 'designation' },
                        { label: 'Tags', property: 'tags' },
                    ],
                },
                fullMatchFn: (a, b) => isEqual(a.designation, b.designation),
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    const diff = [];
                    if (!isEqual(a, b) && isEqual(a.designation, b.designation)) {
                        if (!isEqual(a.tags, b.tags)) {
                            diff.push('tags');
                        }
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => isEqual(a.designation, b.designation),
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareItem['designations'][number]>,
            {
                displayAs: {
                    label: 'Definition',
                    property: 'definitions',
                    data: [
                        { label: 'Definition', property: 'definition' },
                        { label: 'Tags', property: 'tags' },
                    ],
                },
                fullMatchFn: (a, b) => isEqual(a.definition, b.definition),
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    const diff = [];
                    if (!isEqual(a, b) && isEqual(a.definition, b.definition)) {
                        if (!isEqual(a.tags, b.tags)) {
                            diff.push('tags');
                        }
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => isEqual(a.definition, b.definition),
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareItem['definitions'][number]>,
            {
                displayAs: {
                    label: 'Identifiers',
                    property: 'ids',
                    data: [
                        { label: 'Source', property: 'source' },
                        { label: 'Id', property: 'id' },
                        { label: 'Version', property: 'version' },
                    ],
                },
                fullMatchFn: (a, b) =>
                    isEqual(a.source, b.source) && isEqual(a.id, b.id) && isEqual(a.version, b.version),
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    const diff = [];
                    if (!isEqual(a, b) && isEqual(a.source, b.source)) {
                        if (!isEqual(a.id, b.id)) {
                            diff.push('id');
                        }
                        if (!isEqual(a.version, b.version)) {
                            diff.push('version');
                        }
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => isEqual(a.source, b.source),
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareItem['ids'][number]>,
            {
                displayAs: {
                    label: 'Sources',
                    property: 'sources',
                    data: [{ label: 'Name', property: 'sourceName' }],
                },
                fullMatchFn: (a, b) => isEqual(a.sourceName, b.sourceName),
                fullMatches: [],
                partialMatchFn: (a, b) => [],
                partialMatches: [],
                notMatchFn: (a, b) => isEqual(a.sourceName, b.sourceName),
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareItem['sources'][number]>,
            {
                displayAs: {
                    label: 'Reference Documents',
                    property: 'referenceDocuments',
                    data: [
                        { label: 'Title', property: 'title' },
                        { label: 'URI', property: 'uri' },
                        { label: 'Document', property: 'document' },
                        { label: 'Document Type', property: 'docType' },
                        { label: 'Provider Org', property: 'providerOrg' },
                        { label: 'Language Code', property: 'languageCode' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    const diff = [];
                    if (!isEqual(a, b) && isEqual(a.document, b.document)) {
                        if (!isEqual(a.title, b.title)) {
                            diff.push('title');
                        }
                        if (!isEqual(a.uri, b.uri)) {
                            diff.push('uri');
                        }
                        if (!isEqual(a.docType, b.docType)) {
                            diff.push('docType');
                        }
                        if (!isEqual(a.providerOrg, b.providerOrg)) {
                            diff.push('providerOrg');
                        }
                        if (!isEqual(a.languageCode, b.languageCode)) {
                            diff.push('languageCode');
                        }
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => isEqual(a.document, b.document),
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareItem['referenceDocuments'][number]>,
            {
                displayAs: {
                    label: 'Properties',
                    property: 'properties',
                    data: [
                        { label: 'Key', property: 'key' },
                        { label: 'Value', property: 'value' },
                        { label: 'Source', property: 'source' },
                        { label: 'Value Format', property: 'valueFormat' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    const diff = [];
                    if (!isEqual(a, b) && isEqual(a.key, b.key)) {
                        if (!isEqual(a.value, b.value)) {
                            diff.push('value');
                        }
                        if (!isEqual(a.valueFormat, b.valueFormat)) {
                            diff.push('valueFormat');
                        }
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => isEqual(a.key, b.key),
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareItem['properties'][number]>,
        ];
        const dataElementOption: CompareOption<any>[] = [
            {
                displayAs: {
                    label: 'Data Element Concept',
                    property: 'dataElementConcept.concepts',
                    data: [
                        { label: 'Name', property: 'name' },
                        { label: 'Origin', property: 'origin' },
                        { label: 'Origin Id', property: 'originId' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<Concept>,
            {
                displayAs: {
                    label: 'Object Class Concept',
                    property: 'objectClass.concepts',
                    data: [
                        { label: 'Name', property: 'name' },
                        { label: 'Origin', property: 'origin' },
                        { label: 'Origin Id', property: 'originId' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DataElement['objectClass']['concepts'][number]>,
            {
                displayAs: {
                    label: 'Property Concept',
                    property: 'property.concepts',
                    data: [
                        { label: 'Name', property: 'name' },
                        { label: 'Origin', property: 'origin' },
                        { label: 'Origin Id', property: 'originId' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DataElement['property']['concepts'][number]>,
            {
                displayAs: {
                    label: 'Unit of Measure',
                    property: 'valueDomain.uom',
                    data: [{ label: '', property: 'data' }],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DataElement['valueDomain']['uom']>,
            {
                displayAs: {
                    label: 'Data Type',
                    property: 'valueDomain.datatype',
                    data: [{ label: '', property: 'data' }],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DataElement['valueDomain']['datatype']>,
            {
                displayAs: {
                    label: 'Data Type Value List',
                    property: 'valueDomain.datatypeValueList',
                    data: [{ label: 'Data Type', property: 'datatype' }],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DatatypeContainerValueList['datatypeValueList']>,
            {
                displayAs: {
                    label: 'Permissible Values',
                    property: 'valueDomain.permissibleValues',
                    data: [
                        { label: 'Code Value', property: 'permissibleValue' },
                        { label: 'Code Name', property: 'valueMeaningName' },
                        { label: 'Code', property: 'valueMeaningCode' },
                        { label: 'Code System', property: 'codeSystemName' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<ValueDomainValueList['permissibleValues'][number]>,
            {
                displayAs: {
                    label: 'Data Type Number',
                    property: 'valueDomain.datatypeNumber',
                    data: [
                        { label: 'Minimum Value', property: 'minValue' },
                        { label: 'Maximum Value', property: 'maxValue' },
                        { label: 'Precision', property: 'precision' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DatatypeContainerNumber['datatypeNumber']>,
            {
                displayAs: {
                    label: 'Data Type Text',
                    property: 'valueDomain.datatypeText',
                    data: [
                        { label: 'Minimum Length', property: 'minLength' },
                        { label: 'Maximum Length', property: 'maxLength' },
                        { label: 'Regular Expression', property: 'regex' },
                        { label: 'Rule', property: 'rule' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DatatypeContainerText['datatypeText']>,
            {
                displayAs: {
                    label: 'Data Type Date',
                    property: 'valueDomain.datatypeDate',
                    data: [{ label: 'Format', property: 'format' }],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DatatypeContainerDate['datatypeDate']>,
            {
                displayAs: {
                    label: 'Data Type Code',
                    property: 'valueDomain.datatypeDynamicCodeList',
                    data: [{ label: 'System', property: 'system' }],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DatatypeContainerDynamicList['datatypeDynamicCodeList']>,
            {
                displayAs: {
                    label: 'Data Type Time',
                    property: 'valueDomain.datatypeTime',
                    data: [{ label: 'Format', property: 'format' }],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DatatypeContainerTime['datatypeTime']>,
            {
                displayAs: {
                    label: 'Data Type Externally Defined',
                    property: 'valueDomain.datatypeExternallyDefined',
                    data: [
                        { label: 'Link', property: 'link' },
                        { label: 'Description', property: 'description' },
                        { label: 'Description Format', property: 'descriptionFormat' },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<DatatypeContainerExternal['datatypeExternallyDefined']>,
        ];
        const formOption: CompareOption<any>[] = [
            {
                displayAs: {
                    label: 'Questions',
                    property: 'questions',
                    data: [
                        { label: 'Label', property: 'label' },
                        { label: 'Data Type', property: 'question.datatype' },
                        { label: 'CDE', property: 'question.cde.tinyId', url: '/deView?tinyId=' },
                        { label: 'Unit of Measure', property: 'question.unitsOfMeasure' },
                        {
                            label: 'Answer',
                            property: 'question.answers',
                            properties: {
                                label: 'Permissible Value',
                                property: 'permissibleValue',
                            },
                        },
                    ],
                },
                fullMatchFn: isEqual,
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    const diff = [];
                    if (!isEqual(a, b) && isEqual(a.question.cde.tinyId, b.question.cde.tinyId)) {
                        if (!isEqual(a.label, b.label)) {
                            diff.push('label');
                        }
                        if (!isEqual(a.question.datatype, b.question.datatype)) {
                            diff.push('question.datatype');
                        }
                        if (!isEqual(a.question.unitsOfMeasure, b.question.unitsOfMeasure)) {
                            diff.push('question.unitsOfMeasure');
                        }
                        if (
                            !isEqual(
                                (a.question as QuestionValueList).answers,
                                (b.question as QuestionValueList).answers
                            )
                        ) {
                            diff.push('question.answers');
                        }
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: isEqual,
                leftNotMatches: [],
                rightNotMatches: [],
            } as CompareOption<CompareForm['questions'][number]>,
        ];
        let isDataElement = false;
        let isForm = false;
        this.leftUrl = ITEM_MAP[left.elementType].view + left.tinyId;
        this.rightUrl = ITEM_MAP[right.elementType].view + right.tinyId;
        if (left.elementType === 'cde' && right.elementType === 'cde') {
            this.options = commonOption.concat(dataElementOption);
            isDataElement = true;
        }
        if (left.elementType === 'form' && right.elementType === 'form') {
            this.options = commonOption.concat(formOption);
            isForm = true;
        }
        this.canMergeForm = isForm && this.isAllowedModel.isAllowed(left) && this.isAllowedModel.isAllowed(right);
        this.canMergeDataElement =
            isDataElement && this.isAllowedModel.isAllowed(left) && this.isAllowedModel.isAllowed(right);
    }

    getValue(o: any, d: Data): string | undefined {
        const value = get(o, d.property);
        if (!value) {
            return;
        }
        if (d.url) {
            return '<a target="_blank" href="' + d.url + value + '">' + value + '</a>';
        } else if (d.properties) {
            const properties = d.properties;
            const v = value.map((v: any) => get(v, properties.property));
            if (!isEmpty(v)) {
                return d.properties.label + ': ' + v;
            } else {
                return '';
            }
        } else if (isArray(value)) {
            return JSON.stringify(value);
        } else {
            return value;
        }
    }
}
