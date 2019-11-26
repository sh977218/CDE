import { Component, Input, OnInit } from '@angular/core';
import _cloneDeep from 'lodash/cloneDeep';
import _findIndex from 'lodash/findIndex';
import _forEach from 'lodash/forEach';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _slice from 'lodash/slice';
import _uniq from 'lodash/uniq';
import _uniqWith from 'lodash/uniqWith';
import { Concept, Concepts, DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormElement, FormOrElement, FormQuestion, SkipLogic } from 'shared/form/form.model';
import { isCdeForm, isDataElement } from 'shared/item';
import {
    CdeId, Definition, Designation, FormattedValue, PermissibleValue, Property, ReferenceDocument
} from 'shared/models.model';

interface DiffOption {
    data: DiffOptionData[];
    diff?: string[];
    display?: boolean;
    isEqual: (a: any, b: any) => boolean;
    label: string;
    match?: boolean;
    property: string;
    result?: DiffOptionResult[];
}

interface DiffOptionData {
    array?: boolean;
    label: string;
    property: string;
    url?: string;
}

interface DiffOptionResult {
    add?: boolean;
    data?: {
        diff?: any;
    };
    diff?: string[];
    display?: boolean;
    edited?: boolean;
    match: boolean;
    newer?: {};
    older?: {};
    remove?: boolean;
    reorder?: boolean;
}

class ComparedDe extends DataElement {
    concepts?: Concept[];
}

class ComparedForm extends CdeForm {
    questions?: FormElement[];
}

type FeCompare = { question: any, sectionId?: string } & FormElement & DiffOptionResult;

const compareArrayOption: DiffOption[] = [
    {
        label: 'Reference Documents',
        isEqual(a: ReferenceDocument & DiffOptionResult, b: ReferenceDocument & DiffOptionResult) {
            if (!a.diff) {
                a.diff = [];
            }
            if (!b.diff) {
                b.diff = [];
            }
            const result = _isEqual(a.document, b.document)
                && _isEqual(a.title, b.title)
                && _isEqual(a.docType, b.docType)
                && _isEqual(a.uri, b.uri)
                && _isEqual(a.providerOrg, b.providerOrg)
                && _isEqual(a.languageCode, b.languageCode)
                && _isEqual(a.source, b.source);
            if (result) {
                if (!_isEqual(a.document, b.document)) {
                    a.diff.push('document');
                    b.diff.push('document');
                    a.display = true;
                    b.display = true;
                }
                if (!_isEqual(a.title, b.title)) {
                    a.diff.push('title');
                    b.diff.push('title');
                    a.display = true;
                    b.display = true;
                }
                if (!_isEqual(a.docType, b.docType)) {
                    a.diff.push('docType');
                    b.diff.push('docType');
                    a.display = true;
                    b.display = true;
                }
                if (!_isEqual(a.uri, b.uri)) {
                    a.diff.push('uri');
                    b.diff.push('uri');
                    a.display = true;
                    b.display = true;
                }
                if (!_isEqual(a.providerOrg, b.providerOrg)) {
                    a.diff.push('providerOrg');
                    b.diff.push('providerOrg');
                    a.display = true;
                    b.display = true;
                }
                if (!_isEqual(a.languageCode, b.languageCode)) {
                    a.diff.push('languageCode');
                    b.diff.push('languageCode');
                    a.display = true;
                    b.display = true;
                }
                if (!_isEqual(a.source, b.source)) {
                    a.diff.push('source');
                    b.diff.push('source');
                    a.display = true;
                    b.display = true;
                }
            }
            return result;
        },
        property: 'referenceDocuments',
        data: [
            {label: 'Title', property: 'title'},
            {label: 'URI', property: 'uri'},
            {label: 'Provider Org', property: 'providerOrg'},
            {label: 'Language Code', property: 'languageCode'},
            {label: 'Document', property: 'document'}
        ]
    },
    {
        label: 'Designation',
        isEqual(a: Designation & DiffOptionResult, b: Designation & DiffOptionResult) {
            if (!a.diff) {
                a.diff = [];
            }
            if (!b.diff) {
                b.diff = [];
            }
            const result = _isEqual(a.designation, b.designation);
            if (result) {
                if (!_isEqual(a.tags, b.tags)) {
                    a.diff.push('tags');
                    b.diff.push('tags');
                    a.display = true;
                    b.display = true;
                }
            }
            return result;
        },
        property: 'designations',
        data: [
            {label: 'Designation', property: 'designation'},
            {label: 'Tags', property: 'tags', array: true}
        ]
    },
    {
        label: 'Definition',
        isEqual(a: Definition & DiffOptionResult, b: Definition & DiffOptionResult) {
            if (!a.diff) {
                a.diff = [];
            }
            if (!b.diff) {
                b.diff = [];
            }
            const result = _isEqual(a.definition, b.definition);
            if (result) {
                if (!_isEqual(a.definitionFormat, b.definitionFormat)) {
                    a.diff.push('definitionFormat');
                    b.diff.push('definitionFormat');
                    a.display = true;
                    b.display = true;
                }
                if (!_isEqual(a.tags, b.tags)) {
                    a.diff.push('tags');
                    b.diff.push('tags');
                    a.display = true;
                    b.display = true;
                }
            }
            return result;
        },
        property: 'definitions',
        data: [
            {label: 'Definition', property: 'definition'},
            {label: 'Format', property: 'definitionFormat'},
            {label: 'Tags', property: 'tags', array: true}
        ]
    },
    {
        label: 'Properties',
        isEqual(a: Property & DiffOptionResult, b: Property & DiffOptionResult) {
            if (!a.diff) {
                a.diff = [];
            }
            if (!b.diff) {
                b.diff = [];
            }
            const result = _isEqual(a.key, b.key);
            if (result) {
                if (!_isEqual(a.value, b.value)) {
                    a.diff.push('value');
                    b.diff.push('value');
                    a.display = true;
                    b.display = true;
                }
            }
            return result;
        },
        property: 'properties',
        data: [
            {label: 'Key', property: 'key'},
            {label: 'Value', property: 'value'}
        ]
    },
    {
        label: 'Identifiers',
        isEqual(a: CdeId & DiffOptionResult, b: CdeId & DiffOptionResult) {
            if (!a.diff) {
                a.diff = [];
            }
            if (!b.diff) {
                b.diff = [];
            }
            const result = _isEqual(a.source, b.source) && _isEqual(a.id, b.id);
            if (result) {
                if (!_isEqual(a.version, b.version)) {
                    a.diff.push('version');
                    b.diff.push('version');
                    a.display = true;
                    b.display = true;
                }
            }
            return result;
        },
        property: 'ids',
        data: [
            {label: 'Source', property: 'source'},
            {label: 'ID', property: 'id'},
            {label: 'Version', property: 'version'}
        ],
        diff: []
    }
];
const cdeCompareArrayOption: DiffOption[] = [
    {
        label: 'Value List',
        isEqual(a: PermissibleValue & DiffOptionResult, b: PermissibleValue & DiffOptionResult) {
            if (!a.diff) {
                a.diff = [];
            }
            if (!b.diff) {
                b.diff = [];
            }
            const result = _isEqual(a.valueMeaningName, b.valueMeaningName);
            if (result) {
                if (!_isEqual(a.permissibleValue, b.permissibleValue)) {
                    a.diff.push('permissibleValue');
                    b.diff.push('permissibleValue');
                    a.display = true;
                    b.display = true;
                }
                if (!_isEqual(a.valueMeaningDefinition, b.valueMeaningDefinition)) {
                    a.diff.push('valueMeaningDefinition');
                    b.diff.push('valueMeaningDefinition');
                    a.display = true;
                    b.display = true;
                }
            }
            return result;
        },
        property: 'valueDomain.permissibleValues',
        data: [
            {label: 'Value', property: 'permissibleValue'},
            {label: 'Code Name', property: 'valueMeaningName'},
            {label: 'Code', property: 'valueMeaningCode'},
            {label: 'Code System', property: 'codeSystemName'},
            {label: 'Code Description', property: 'valueMeaningDefinition'}
        ],
        diff: []
    },
    {
        label: 'Concepts',
        isEqual(a: Concept & DiffOptionResult, b: Concept & DiffOptionResult) {
            return _isEqual(a, b);
        },
        property: 'concepts',
        data: [
            {label: 'Name', property: 'name'},
            {label: 'Origin', property: 'origin'},
            {label: 'Origin Id', property: 'originId'}
        ],
        diff: []
    }
];
const formCompareArrayOption: DiffOption[] = [
    {
        label: 'Form Elements',
        isEqual(a: FeCompare, b: FeCompare) {
            if (a.elementType === 'question' && b.elementType === 'question') {
                if (!a.diff) {
                    a.diff = [];
                }
                if (!b.diff) {
                    b.diff = [];
                }
                const result = _isEqual(a.question.cde.tinyId, b.question.cde.tinyId);
                if (result) {
                    if (!a || !b) {
                    }
                    if (!_isEqual(a.label, b.label)) {
                        a.diff.push('label');
                        b.diff.push('label');
                        a.display = true;
                        b.display = true;
                    }
                    if (!_isEqual(a.instructions && a.instructions.value, b.instructions && b.instructions.value)) {
                        a.diff.push('instructions.value');
                        b.diff.push('instructions.value');
                        a.display = true;
                        b.display = true;
                    }
                    if (!_isEqual(a.question.unitsOfMeasure, b.question.unitsOfMeasure)) {
                        a.diff.push('question.uom');
                        b.diff.push('question.uom');
                        a.display = true;
                        b.display = true;
                    }
                    if (!_isEqual(a.skipLogic && a.skipLogic.condition, b.skipLogic && b.skipLogic.condition)) {
                        a.diff.push('skipLogic.condition');
                        b.diff.push('skipLogic.condition');
                        a.display = true;
                        b.display = true;
                    }
                    if (a.question.datatype === 'Value List' && b.question.datatype === 'Value List'
                        && !_isEqual(a.question.answers, b.question.answers)) {
                        a.diff.push('question.answers');
                        b.diff.push('question.answers');
                        a.question.answers = JSON.stringify(a.question.answers);
                        b.question.answers = JSON.stringify(b.question.answers);
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            }
            if (a.elementType === 'form' && b.elementType === 'form') {
                if (!a.diff) {
                    a.diff = [];
                }
                if (!b.diff) {
                    b.diff = [];
                }
                const result = _isEqual(a.inForm.form.tinyId, b.inForm.form.tinyId);
                if (result) {
                    if (!_isEqual(a.instructions && a.instructions.value, b.instructions && b.instructions.value)) {
                        a.diff.push('instructions.value');
                        b.diff.push('instructions.value');
                        a.display = true;
                        b.display = true;
                    }
                    if (!_isEqual(a.repeat, b.repeat)) {
                        a.diff.push('repeat');
                        b.diff.push('repeat');
                        a.display = true;
                        b.display = true;
                    }
                    if (!_isEqual(a.skipLogic && a.skipLogic.condition, b.skipLogic && b.skipLogic.condition)) {
                        a.diff.push('skipLogic.condition');
                        b.diff.push('skipLogic.condition');
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            }
            if (a.elementType === 'section' && b.elementType === 'section') {
                if (!a.diff) {
                    a.diff = [];
                }
                if (!b.diff) {
                    b.diff = [];
                }
                const result = _isEqual(a.sectionId, b.sectionId);
                if (result) {
                    if (!_isEqual(a.instructions && a.instructions.value, b.instructions && b.instructions.value)) {
                        a.diff.push('instructions.value');
                        b.diff.push('instructions.value');
                        a.display = true;
                        b.display = true;
                    }
                    if (!_isEqual(a.repeat, b.repeat)) {
                        a.diff.push('repeat');
                        b.diff.push('repeat');
                        a.display = true;
                        b.display = true;
                    }
                    if (!_isEqual(a.skipLogic && a.skipLogic.condition, b.skipLogic && b.skipLogic.condition)) {
                        a.diff.push('skipLogic.condition');
                        b.diff.push('skipLogic.condition');
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            }
            return false;
        },
        property: 'questions',
        data: [
            {label: 'Label', property: 'label'},
            {label: 'Element Type', property: 'elementType'},
            {label: 'Form', property: 'inForm.form.tinyId', url: '/formView?tinyId='},
            {label: 'CDE', property: 'question.cde.tinyId', url: '/deView?tinyId='},
            {label: 'Unit of Measure', property: 'question.unitsOfMeasure'},
            {label: 'repeat', property: 'repeat'},
            {label: 'Skip Logic', property: 'skipLogic.condition'},
            {label: 'Instruction', property: 'instructions.value'},
            {label: 'Answer', property: 'question.answers', array: true}
        ],
        diff: []
    }
];

@Component({
    selector: 'cde-compare-item-array',
    templateUrl: './compareItemArray.component.html',
    styles: [`
        :host .arrayObj {
            border: 1px solid #ccc;
            padding: 9.5px;
            margin: 0 0 10px;
        }

        :host .arrayObjRemove {
            border-left: 5px solid #a94442
        }

        :host .arrayObjAdd {
            border-left: 5px solid #008000
        }

        :host .arrayObjEdit {
            border-left: 5px solid #0000ff
        }

        :host .arrayObjReorder {
            border-left: 5px solid #fad000
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
export class CompareItemArrayComponent implements OnInit {
    @Input() older!: ComparedDe | ComparedForm;
    @Input() newer!: ComparedDe | ComparedForm;
    @Input() filter!: { add: { select: any }, edited: { select: any }, remove: { select: any }, reorder: { select: any } };
    compareArrayOption: DiffOption[] = [];
    newerArray: any = {};
    olderArray: any = {};

    constructor() {
    }

    ngOnInit(): void {
        if (isDataElement(this.newer) && isDataElement(this.older)) {
            if (!this.newer.property) {
                this.newer.property = new Concepts();
            }
            if (!this.older.property) {
                this.older.property = new Concepts();
            }
            if (!this.newer.objectClass) {
                this.newer.objectClass = new Concepts();
            }
            if (!this.older.objectClass) {
                this.older.objectClass = new Concepts();
            }
            if (!this.newer.dataElementConcept) {
                this.newer.dataElementConcept = {concepts: []};
            }
            if (!this.older.dataElementConcept) {
                this.older.dataElementConcept = {concepts: []};
            }
            this.older.concepts = this.older.property.concepts
                .concat(this.older.objectClass.concepts)
                .concat(this.older.dataElementConcept.concepts || []);
            this.newer.concepts = this.newer.property.concepts
                .concat(this.newer.objectClass.concepts)
                .concat(this.newer.dataElementConcept.concepts || []);
            this.compareArrayOption = compareArrayOption.concat(cdeCompareArrayOption);
        } else if (isCdeForm(this.newer) && isCdeForm(this.older)) {
            this.older.questions = [];
            this.newer.questions = [];
            flatFormQuestions(this.older, this.older.questions);
            flatFormQuestions(this.newer, this.newer.questions);
            this.compareArrayOption = compareArrayOption.concat(formCompareArrayOption);
        }
        doCompareArray(this.newer, this.older, this.compareArrayOption);
    }
}

function copyValue(obj: any, data: DiffOptionData[]) {
    _forEach(data, d => {
        let value = _get(obj, d.property);
        if (_isEmpty(value)) {
            value = '';
        }
        obj[d.property] = value;
    });
}

function doCompareArray(newer: any, older: any, option: DiffOption[]) {
    _forEach(option, property => {
        if (!newer && !older) {
            property.match = true;
            property.display = false;
            return;
        }
        if (!property.isEqual) {
            property.isEqual = _isEqual;
        }
        let l = [];
        if (newer) {
            l = _get(newer, property.property);
        }
        let r = [];
        if (older) {
            r = _get(older, property.property);
        }
        doCompareArrayImpl(l, r, property);
    });
}

function doCompareArrayImpl(newer: DiffOption[], older: DiffOption[], option: DiffOption) {
    option.result = [];
    const result = option.result;
    let beginIndex = 0;

    _forEach(newer, (l, leftIndex) => {
        const rightArrayCopy: DiffOption[] = _slice(older, beginIndex);
        const rightIndex = _findIndex(rightArrayCopy, o => option.isEqual(o, l));
        if (rightIndex === -1) {
            if (leftIndex === newer.length - 1) {
                result.push({
                    match: false,
                    add: true,
                    data: l,
                    newer: l
                });
                rightArrayCopy.forEach((o: any) => {
                    result.push({
                        match: false,
                        add: true,
                        data: o,
                        older: o
                    });
                });
            } else {
                result.push({
                    match: false,
                    add: true,
                    data: l,
                    newer: l
                });
            }
        } else { // found match in right array
            const r: any = rightArrayCopy[rightIndex];
            for (let k = 0; k < rightIndex; k++) {
                result.push({
                    match: false,
                    add: true,
                    data: rightArrayCopy[k],
                    older: rightArrayCopy[k]
                });
                beginIndex++;
            }
            if (!l.diff) {
                l.diff = [];
            }
            if (!r.diff) {
                r.diff = [];
            }
            result.push({
                match: true,
                display: l.display && r.display,
                older: l,
                newer: r,
                diff: _uniq(l.diff.concat(r.diff)),
                edited: true,
            });
            beginIndex++;
        }
        if (leftIndex === newer.length - 1) {
            rightArrayCopy.forEach((o, i) => {
                if (i > 0) {
                    result.push({
                        match: false,
                        add: true,
                        data: o,
                        older: o
                    });
                }
            });
        }
    });
    if (option.result) {
        option.match = !(option.result.filter(p => !p.match).length > 0);
        option.display = option.result.filter(p => p.display).length > 0;
        option.result.forEach(r => {
            if (r.newer && r.add) {
                if (_findIndex(older, o => {
                    const temp = option.isEqual(o, r.data);
                    if (temp) {
                        r.older = _cloneDeep(o);
                    }
                    return temp;
                }) !== -1) {
                    delete r.add;
                    if (!r.match) {
                        r.diff = _uniq(r.data && r.data.diff);
                    }
                    r.reorder = true;
                }
            }
            if (r.older && r.add) {
                if (_findIndex(newer, o => option.isEqual(o, r.data)) === -1) {
                    delete r.add;
                    r.remove = true;
                } else {
                    delete r.add;
                    if (!r.match) {
                        r.diff = _uniq(r.data && r.data.diff);
                    }
                    r.reorder = true;
                }
            }
        });
        option.result = _uniqWith(option.result, (willRemove: any, willStay) => {
            if (willRemove.reorder && willStay.reorder) {
                if (!willStay.newer) {
                    willStay.newer = willRemove.newer;
                }
                if (!willStay.older) {
                    willStay.older = willRemove.older;
                }
                const aData = _cloneDeep(willRemove.data);
                delete aData.diff;
                const bData = _cloneDeep(willStay.data);
                delete bData.diff;
                if (option.isEqual(aData, bData)) {
                    return true;
                }
            }
            if (willRemove.add && willStay.add) {
                const aData = _cloneDeep(willRemove.data);
                delete aData.diff;
                const bData = _cloneDeep(willStay.data);
                delete bData.diff;
                if (option.isEqual(aData, bData)) {
                    return true;
                }
            }
            if (willRemove.remove && willStay.remove) {
                const aData = _cloneDeep(willRemove.data);
                delete aData.diff;
                const bData = _cloneDeep(willStay.data);
                delete bData.diff;
                if (option.isEqual(aData, bData)) {
                    return true;
                }
            }
            return false;
        });
        option.result.forEach(r => {
            if (r.data) {
                copyValue(r.data, option.data);
            }
            if (r.newer) {
                copyValue(r.newer, option.data);
            }
            if (r.older) {
                copyValue(r.older, option.data);
            }
        });
    }
}

function fixFormElement(f: FormElement) {
    if (!f.skipLogic) {
        f.skipLogic = new SkipLogic();
    }
    if (!f.instructions) {
        f.instructions = new FormattedValue();
    }
}

function flatFormQuestions(fe: FormOrElement, questions: (FormElement & { sectionId?: string })[]) {
    let index = 0;
    if (fe.formElements !== undefined) {
        _forEach(fe.formElements, e => {
            if (e.elementType && e.elementType === 'question') {
                const questionCopy = _cloneDeep(e);
                fixFormElement(questionCopy);
                questions.push(questionCopy);
            } else if (e.elementType && e.elementType === 'form') {
                const formCopy = _cloneDeep(e);
                fixFormElement(formCopy);
                questions.push(formCopy);
            } else if (e.elementType && e.elementType === 'section') {
                const sectionCopy: FormElement & { sectionId?: string } = _cloneDeep(e);
                fixFormElement(sectionCopy);
                sectionCopy.sectionId = 'section_' + index;
                index++;
                questions.push(sectionCopy);
                flatFormQuestions(e, questions);
            }
        });
    }
}
