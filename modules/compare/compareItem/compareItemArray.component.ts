import { Component, Input, OnInit } from '@angular/core';
import { forEach, get, isEmpty, isEqual, intersectionWith, differenceWith } from 'lodash';
import { Concept, Concepts, DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormElement, FormOrElement, SkipLogic } from 'shared/form/form.model';
import { isCdeForm, isDataElement } from 'shared/item';
import { FormattedValue } from 'shared/models.model';
import { deepCopy } from 'shared/util';

class ComparedDe extends DataElement {
    concepts?: Concept[];
}

class ComparedForm extends CdeForm {
    questions?: FormElement[];
}

const compareArrayOption: any[] = [
    {
        label: 'Reference Documents',
        isEqual(a: any, b: any) {
            if (!a.diff) {
                a.diff = new Set<string>();
            }
            if (!b.diff) {
                b.diff = new Set<string>();
            }
            const result = isEqual(a.document, b.document);
            if (result) {
                if (!isEqual(a.title, b.title)) {
                    a.diff.add('title');
                    b.diff.add('title');
                    a.display = true;
                    b.display = true;
                }
                if (!isEqual(a.uri, b.uri)) {
                    a.diff.add('uri');
                    b.diff.add('uri');
                    a.display = true;
                    b.display = true;
                }
                if (!isEqual(a.providerOrg, b.providerOrg)) {
                    a.diff.add('providerOrg');
                    b.diff.add('providerOrg');
                    a.display = true;
                    b.display = true;
                }
                if (!isEqual(a.languageCode, b.languageCode)) {
                    a.diff.add('languageCode');
                    b.diff.add('languageCode');
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
        isEqual(a: any, b: any) {
            if (!a.diff) {
                a.diff = new Set<string>();
            }
            if (!b.diff) {
                b.diff = new Set<string>();
            }
            const result = isEqual(a.designation, b.designation);
            if (result) {
                if (!isEqual(a.tags, b.tags)) {
                    a.diff.add('tags');
                    b.diff.add('tags');
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
        isEqual(a: any, b: any) {
            if (!a.diff) {
                a.diff = new Set<string>();
            }
            if (!b.diff) {
                b.diff = new Set<string>();
            }
            const result = isEqual(a.definition, b.definition);
            if (result) {
                if (!isEqual(a.definitionFormat, b.definitionFormat)) {
                    a.diff.add('definitionFormat');
                    b.diff.add('definitionFormat');
                    a.display = true;
                    b.display = true;
                }
                if (!isEqual(a.tags, b.tags)) {
                    a.diff.add('tags');
                    b.diff.add('tags');
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
        isEqual(a: any, b: any) {
            if (!a.diff) {
                a.diff = new Set<string>();
            }
            if (!b.diff) {
                b.diff = new Set<string>();
            }
            const result = isEqual(a.key, b.key);
            if (result) {
                if (!isEqual(a.value, b.value)) {
                    a.diff.add('value');
                    b.diff.add('value');
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
        isEqual(a: any, b: any) {
            if (!a.diff) {
                a.diff = new Set<string>();
            }
            if (!b.diff) {
                b.diff = new Set<string>();
            }
            const result = isEqual(a.source, b.source) && isEqual(a.id, b.id);
            if (result) {
                if (!isEqual(a.version, b.version)) {
                    a.diff.add('version');
                    b.diff.add('version');
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

const cdeCompareArrayOption: any[] = [
    {
        label: 'Value List',
        isEqual(a: any, b: any) {
            const result = isEqual(a.valueMeaningName, b.valueMeaningName);
            if (isEmpty(a.diff)) {
                a.diff = new Set<string>();
            }
            if (isEmpty(b.diff)) {
                b.diff = new Set<string>();
            }
            if (result) {
                if (!isEqual(a.permissibleValue, b.permissibleValue)) {
                    a.diff.add('permissibleValue');
                    b.diff.add('permissibleValue');
                    a.display = true;
                    b.display = true;
                }
                if (!isEqual(a.valueMeaningDefinition, b.valueMeaningDefinition)) {
                    a.diff.add('valueMeaningDefinition');
                    b.diff.add('valueMeaningDefinition');
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
        ]
    },
    {
        label: 'Concepts',
        isEqual(a: any, b: any) {
            if (!a.diff) {
                a.diff = new Set<string>();
            }
            if (!b.diff) {
                b.diff = new Set<string>();
            }
            return isEqual(a, b);
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
const formCompareArrayOption: any[] = [
    {
        label: 'Form Elements',
        isEqual(a: any, b: any) {
            if (a.elementType === 'question' && b.elementType === 'question') {
                if (!a.diff) {
                    a.diff = new Set<string>();
                }
                if (!b.diff) {
                    b.diff = new Set<string>();
                }
                const result = isEqual(a.question.cde.tinyId, b.question.cde.tinyId);
                if (result) {
                    if (!isEqual(a.label, b.label)) {
                        a.diff.add('label');
                        b.diff.add('label');
                        a.display = true;
                        b.display = true;
                    }
                    if (!isEqual(a.instructions && a.instructions.value, b.instructions && b.instructions.value)) {
                        a.diff.add('instructions.value');
                        b.diff.add('instructions.value');
                        a.display = true;
                        b.display = true;
                    }
                    if (!isEqual(a.question.unitsOfMeasure, b.question.unitsOfMeasure)) {
                        a.diff.add('question.unitsOfMeasure');
                        b.diff.add('question.unitsOfMeasure');
                        a.display = true;
                        b.display = true;
                    }
                    if (!isEqual(a.skipLogic && a.skipLogic.condition, b.skipLogic && b.skipLogic.condition)) {
                        a.diff.add('skipLogic.condition');
                        b.diff.add('skipLogic.condition');
                        a.display = true;
                        b.display = true;
                    }
                    if (a.question.datatype === 'Value List' && b.question.datatype === 'Value List'
                        && !isEqual(a.question.answers, b.question.answers)) {
                        a.diff.add('question.answers');
                        b.diff.add('question.answers');
                        a.question.answers = JSON.stringify(a.question.answers);
                        b.question.answers = JSON.stringify(b.question.answers);
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            }
            if ((a.elementType === 'form' && b.elementType === 'form') || (a.elementType === 'section' && b.elementType === 'section')) {
                if (isEmpty(a.diff)) {
                    a.diff = new Set<string>();
                }
                if (isEmpty(b.diff)) {
                    b.diff = new Set<string>();
                }

                let result = isEqual(a.sectionId, b.sectionId);
                if (a.elementType === 'form' && b.elementType === 'form') {
                    result = isEqual(a.inForm.form.tinyId, b.inForm.form.tinyId);
                }
                if (result) {
                    if (!isEqual(a.instructions && a.instructions.value ? a.instructions.value : '',
                        b.instructions && b.instructions.value ? b.instructions.value : '')) {
                        a.diff.add('instructions.value');
                        b.diff.add('instructions.value');
                        a.display = true;
                        b.display = true;
                    }
                    if (!isEqual(a.repeat, b.repeat)) {
                        a.diff.add('repeat');
                        b.diff.add('repeat');
                        a.display = true;
                        b.display = true;
                    }
                    if (!isEqual(a.skipLogic && a.skipLogic.condition, b.skipLogic && b.skipLogic.condition)) {
                        a.diff.add('skipLogic.condition');
                        b.diff.add('skipLogic.condition');
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
        diff: new Set<string>()
    }
];

@Component({
    selector: 'cde-compare-item-array',
    templateUrl: './compareItemArray.component.html'
})
export class CompareItemArrayComponent implements OnInit {
    @Input() older!: ComparedDe | ComparedForm;
    @Input() newer!: ComparedDe | ComparedForm;
    @Input() filter!: { add: { select: any }, edited: { select: any }, remove: { select: any }, reorder: { select: any } };
    options: any[] = [];
    _get = get;
    _isEmpty = isEmpty;

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
            this.options = compareArrayOption.concat(cdeCompareArrayOption);
        } else if (isCdeForm(this.newer) && isCdeForm(this.older)) {
            this.older.questions = [];
            this.newer.questions = [];
            flatFormQuestions(this.older, this.older.questions);
            flatFormQuestions(this.newer, this.newer.questions);
            this.options = compareArrayOption.concat(formCompareArrayOption);
        }
        doCompareArray(this.newer, this.older, this.options);
    }
}

function doCompareArray(newer: any, older: any, options: any[]) {
    forEach(options, (option: any) => {
        if (!newer && !older) {
            option.match = true;
            option.display = false;
            return;
        }
        if (!option.isEqual) {
            option.isEqual = isEqual;
        }
        let l = [];
        if (newer) {
            l = get(newer, option.property);
        }
        let r = [];
        if (older) {
            r = get(older, option.property);
        }
        doCompareArrayImpl(l, r, option);
    });
}

function doCompareArrayImpl(currentArray: any[], priorArray: any[], option: any) {
    const inCurrentNotInPrior = differenceWith(currentArray, priorArray, option.isEqual).map((o: any) => {
        const temp: any = {};
        temp.currentElt = o;
        temp.priorElt = o;
        temp.add = true;
        return temp;
    });
    const inPriorNotInCurrent: any[] = differenceWith(priorArray, currentArray, option.isEqual).map((o: any) => {
        const temp: any = {};
        temp.currentElt = o;
        temp.priorElt = o;
        temp.remove = true;
        return temp;
    });
    const inPriorInCurrent: any[] = [];
    intersectionWith(priorArray, currentArray, (a: any, b: any) => {
        const equal = option.isEqual(a, b);
        if (equal) {
            const temp: any = {};
            temp.currentElt = b;
            temp.priorElt = a;
            const diff = new Set();
            Array.from(a.diff).concat(Array.from(b.diff)).forEach(d => {
                if (!isEmpty(d)) {
                    diff.add(d);
                }
            });
            temp.diff = Array.from(diff);
            temp.edit = !isEmpty(diff);
            if (temp.edit) {
                inPriorInCurrent.push(temp);
            }
        }
        return equal;
    });
    option.result = inCurrentNotInPrior.concat(inPriorNotInCurrent).concat(inPriorInCurrent);
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
        forEach(fe.formElements, (e: FormElement) => {
            if (e.elementType && e.elementType === 'question') {
                const questionCopy = deepCopy(e);
                fixFormElement(questionCopy);
                questions.push(questionCopy);
            } else if (e.elementType && e.elementType === 'form') {
                const formCopy = deepCopy(e);
                fixFormElement(formCopy);
                questions.push(formCopy);
            } else if (e.elementType && e.elementType === 'section') {
                const sectionCopy: FormElement & { sectionId?: string } = deepCopy(e);
                fixFormElement(sectionCopy);
                sectionCopy.sectionId = 'section_' + index;
                index++;
                questions.push(sectionCopy);
                flatFormQuestions(e, questions);
            }
        });
    }
}
