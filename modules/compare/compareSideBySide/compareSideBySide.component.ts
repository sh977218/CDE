import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import _cloneDeep from 'lodash/cloneDeep';
import _differenceWith from 'lodash/differenceWith';
import _get from 'lodash/get';
import _intersectionWith from 'lodash/intersectionWith';
import _isArray from 'lodash/isArray';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import { forkJoin } from 'rxjs/observable/forkJoin';

const URL_MAP = {
    cde: '/de/',
    form: '/form/'
};

@Component({
    selector: 'cde-compare-side-by-side',
    templateUrl: 'compareSideBySide.component.html',
    styles: [`
        .fullMatch {
            background-color: rgba(223, 240, 216, .79);
            margin: 2px 0;
        }

        .partialMatch {
            background-color: rgba(240, 225, 53, .79);
            margin: 2px 0;
        }

        .notMatch {
            background-color: rgba(242, 217, 217, .5);
            margin: 2px 0;
        }

        :host >>> ins {
            color: black;
            background: #bbffbb;
        }

        :host >>> del {
            color: black;
            background: #ffbbbb;
        }
    `]
})
export class CompareSideBySideComponent {

    @ViewChild('compareSideBySideContent') public compareSideBySideContent: TemplateRef<any>;
    @Input() elements: any = [];
    options = [];
    leftUrl;
    rightUrl;
    left;
    right;
    canMergeForm: boolean = false;
    canMergeDataElement: boolean = false;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public dialog: MatDialog,
                public quickBoardService: QuickBoardListService) {
    }

    doneMerge(event) {
        this.left = event.left;
        this.right = event.right;
        this.doCompare(this.left, this.right, () => {
        });
    }

    doCompare(l, r, cb) {
        let leftObservable = this.http.get(URL_MAP[l.elementType] + l.tinyId);
        let rightObservable = this.http.get(URL_MAP[r.elementType] + r.tinyId);
        forkJoin([leftObservable, rightObservable]).subscribe(results => {
            this.left = <any>results[0];
            this.right = <any>results[1];
            if (this.left.elementType === 'form') {
                this.left.questions = this.flatFormQuestions(this.left);
            }
            if (this.right.elementType === 'form') {
                this.right.questions = this.flatFormQuestions(this.right);
            }
            this.getOptions(this.left, this.right);
            this.options.forEach(option => {
                let l = _get(this.left, option.displayAs.property);
                let r = _get(this.right, option.displayAs.property);
                if (!l) l = [];
                if (!r) r = [];
                if (typeof l !== 'object') l = [{data: l}];
                if (!_isArray(l)) l = [l];
                if (typeof r !== 'object') r = [{data: r}];
                if (!_isArray(r)) r = [r];
                _intersectionWith(l, r, (a, b) => {
                    let fullMatchFnMatchDiff = option.fullMatchFn(a, b);
                    if (fullMatchFnMatchDiff) {
                        option.displayAs.display = true;
                        option.fullMatches.push({left: a, right: b});
                        return true;
                    }
                });
                _intersectionWith(l, r, (a, b) => {
                    let partialMatchDiff = option.partialMatchFn(a, b);
                    if (partialMatchDiff.length > 0) {
                        option.displayAs.display = true;
                        option.partialMatches.push({left: a, right: b, diff: partialMatchDiff});
                        return true;
                    }
                });
                option.leftNotMatches = _differenceWith(l, r, option.notMatchFn);
                option.rightNotMatches = _differenceWith(r, l, option.notMatchFn);
                if (option.leftNotMatches.length > 0 || option.rightNotMatches.length > 0) {
                    option.displayAs.display = true;
                }
            });
            cb();
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    flatFormQuestions(fe) {
        let questions = [];
        if (fe.formElements) {
            fe.formElements.forEach(e => {
                if (e.elementType && e.elementType === 'question') {
                    delete e.formElements;
                    delete e._id;
                    questions.push(_cloneDeep(e));
                } else questions = questions.concat(this.flatFormQuestions(e));
            });
        }
        return questions;
    }

    getOptions(left, right) {
        let commonOption = [
            {
                displayAs: {
                    label: 'Steward',
                    property: 'stewardOrg.name',
                    data: [{label: '', property: 'data'}]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Status',
                    property: 'registrationState.registrationStatus',
                    data: [{label: '', property: 'data'}]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => [],
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Designation',
                    property: 'designations',
                    data: [
                        {label: 'Designation', property: 'designation'},
                        {label: 'Tags', property: 'tags'}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _isEqual(a.designation, b.designation);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_isEqual(a, b) && _isEqual(a.designation, b.designation)) {
                        if (!_isEqual(a.tags, b.tags)) diff.push('tags');
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _isEqual(a.designation, b.designation);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Definition',
                    property: 'definitions',
                    data: [
                        {label: 'Definition', property: 'definition'},
                        {label: 'Tags', property: 'tags'}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _isEqual(a.definition, b.definition);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_isEqual(a, b) && _isEqual(a.definition, b.definition)) {
                        if (!_isEqual(a.tags, b.tags)) diff.push('tags');
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _isEqual(a.definition, b.definition);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: "Identifiers",
                    property: "ids",
                    data: [
                        {label: "Source", property: "source"},
                        {label: "Id", property: "id"},
                        {label: "Version", property: "version"}
                    ]
                },
                fullMatchFn: (a, b) => {
                    return _isEqual(a.source, b.source) && _isEqual(a.id, b.id) && _isEqual(a.version, b.version);
                },
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_isEqual(a, b) && _isEqual(a.source, b.source)) {
                        if (!_isEqual(a.id, b.id)) diff.push("id");
                        if (!_isEqual(a.version, b.version)) diff.push("version");
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => _isEqual(a.source, b.source),
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Reference Documents',
                    property: 'referenceDocuments',
                    data: [
                        {label: 'Title', property: 'title'},
                        {label: 'URI', property: 'uri'},
                        {label: 'Document', property: 'document'},
                        {label: 'Document Type', property: 'docType'},
                        {label: 'Provider Org', property: 'providerOrg'},
                        {label: 'Language Code', property: 'languageCode'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_isEqual(a, b) && _isEqual(a.document, b.document)) {
                        if (!_isEqual(a.title, b.title)) diff.push('title');
                        if (!_isEqual(a.uri, b.uri)) diff.push('uri');
                        if (!_isEqual(a.docType, b.docType)) diff.push('docType');
                        if (!_isEqual(a.providerOrg, b.providerOrg)) diff.push('providerOrg');
                        if (!_isEqual(a.languageCode, b.languageCode)) diff.push('languageCode');
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _isEqual(a.document, b.document);
                },
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Properties',
                    property: 'properties',
                    data: [
                        {label: 'Key', property: 'key'},
                        {label: 'Value', property: 'value'},
                        {label: 'Source', property: 'source'},
                        {label: 'Value Format', property: 'valueFormat'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_isEqual(a, b) && _isEqual(a.key, b.key)) {
                        if (!_isEqual(a.value, b.value)) diff.push('value');
                        if (!_isEqual(a.valueFormat, b.valueFormat)) diff.push('valueFormat');
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: (a, b) => {
                    return _isEqual(a.key, b.key);
                },
                leftNotMatches: [],
                rightNotMatches: []
            }
        ];

        let dataElementOption = [
            {
                displayAs: {
                    label: 'Data Element Concept',
                    property: 'dataElementConcept.concepts',
                    data: [
                        {label: 'Name', property: 'name'},
                        {label: 'Origin', property: 'origin'},
                        {label: 'Origin Id', property: 'originId'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Object Class Concept',
                    property: 'objectClass.concepts',
                    data: [{label: 'Name', property: 'name'},
                        {label: 'Origin', property: 'origin'},
                        {label: 'Origin Id', property: 'originId'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Property Concept',
                    property: 'property.concepts',
                    data: [{label: 'Name', property: 'name'},
                        {label: 'Origin', property: 'origin'},
                        {label: 'Origin Id', property: 'originId'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Unit of Measure',
                    property: 'valueDomain.uom',
                    data: [
                        {label: '', property: 'data'},
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Data Type',
                    property: 'valueDomain.datatype',
                    data: [
                        {label: '', property: 'data'},
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Data Type Value List',
                    property: 'valueDomain.datatypeValueList',
                    data: [
                        {label: 'Data Type', property: 'datatype'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Permissible Values',
                    property: 'valueDomain.permissibleValues',
                    data: [
                        {label: 'Code Value', property: 'permissibleValue'},
                        {label: 'Code Name', property: 'valueMeaningName'},
                        {label: 'Code', property: 'valueMeaningCode'},
                        {label: 'Code System', property: 'codeSystemName'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Data Type Number',
                    property: 'valueDomain.datatypeNumber',
                    data: [
                        {label: 'Minimum Value', property: 'minValue'},
                        {label: 'Maximum Value', property: 'maxValue'},
                        {label: 'Precision', property: 'precision'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Data Type Text',
                    property: 'valueDomain.datatypeText',
                    data: [
                        {label: 'Minimum Length', property: 'minLength'},
                        {label: 'Maximum Length', property: 'maxLength'},
                        {label: 'Regular Expression', property: 'regex'},
                        {label: 'Rule', property: 'rule'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Data Type Date',
                    property: 'valueDomain.datatypeDate',
                    data: [
                        {label: 'Format', property: 'format'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Data Type Code',
                    property: 'valueDomain.datatypeDynamicCodeList',
                    data: [
                        {label: 'System', property: 'system'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Data Type Time',
                    property: 'valueDomain.datatypeTime',
                    data: [
                        {label: 'Format', property: 'format'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            },
            {
                displayAs: {
                    label: 'Data Type Externally Defined',
                    property: 'valueDomain.datatypeExternallyDefined',
                    data: [
                        {label: 'Link', property: 'link'},
                        {label: 'Description', property: 'description'},
                        {label: 'Description Format', property: 'descriptionFormat'}
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: () => {
                    return [];
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            }
        ];
        let formOption = [
            {
                displayAs: {
                    label: 'Questions',
                    property: 'questions',
                    data: [
                        {label: 'Label', property: 'label'},
                        {label: 'Data Type', property: 'question.datatype'},
                        {label: 'CDE', property: 'question.cde.tinyId', url: '/deView?tinyId='},
                        {label: 'Unit of Measure', property: 'question.unitsOfMeasure'},
                        {
                            label: 'Answer', property: 'question.answers', properties: {
                                label: 'Permissible Value', property: 'permissibleValue'
                            }
                        }
                    ]
                },
                fullMatchFn: _isEqual,
                fullMatches: [],
                partialMatchFn: (a, b) => {
                    let diff = [];
                    if (!_isEqual(a, b) && _isEqual(a.question.cde.tinyId, b.question.cde.tinyId)) {
                        if (!_isEqual(a.label, b.label)) diff.push('label');
                        if (!_isEqual(a.question.datatype, b.question.datatype)) diff.push('question.datatype');
                        if (!_isEqual(a.question.unitsOfMeasure, b.question.unitsOfMeasure)) diff.push('question.unitsOfMeasure');
                        if (!_isEqual(a.question.answers, b.question.answers)) diff.push('question.answers');
                    }
                    return diff;
                },
                partialMatches: [],
                notMatchFn: _isEqual,
                leftNotMatches: [],
                rightNotMatches: []
            }
        ];
        let isDataElement = false;
        let isForm = false;
        if (left.elementType === 'cde' && right.elementType === 'cde') {
            this.options = commonOption.concat(dataElementOption);
            this.leftUrl = 'deView?tinyId=' + left.tinyId;
            this.rightUrl = 'deView?tinyId=' + right.tinyId;
            isDataElement = true;
        }
        if (left.elementType === 'form' && right.elementType === 'form') {
            this.options = commonOption.concat(formOption);
            this.leftUrl = 'formView?tinyId=' + left.tinyId;
            this.rightUrl = 'formView?tinyId=' + right.tinyId;
            isForm = true;
        }
        this.canMergeForm = isForm && this.isAllowedModel.isAllowed(left) &&
            this.isAllowedModel.isAllowed(right);
        this.canMergeDataElement = isDataElement && this.isAllowedModel.isAllowed(left) &&
            this.isAllowedModel.isAllowed(right);
    }

    getValue(o, d) {
        let value = _get(o, d.property);
        if (!value) return;
        if (d.url) return '<a target="_blank" href="' + d.url + value + '">' + value + '</a>';
        else if (d.properties) {
            let v = value.map(v => _get(v, d.properties.property));
            if (!_isEmpty(v)) return d.properties.label + ': ' + v;
            else return '';
        } else if (_isArray(value)) {
            return JSON.stringify(value);
        } else return value;
    }

    openCompareSideBySideContent() {
        let selectedDEs = this.elements.filter(d => d.checked);
        if (this.elements.length === 2) {
            selectedDEs = this.elements;
        }
        if (selectedDEs.length !== 2) {
            this.alert.addAlert('warning', 'Please select only two elements to compare.');
            return;
        }
        this.doCompare(selectedDEs[0], selectedDEs[1], () => {
            this.dialog.open(this.compareSideBySideContent, {width: '1200px'});
        });
    }
}
