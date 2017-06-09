import { Component, Input, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { CompareService } from "../core/public/compare.service";
import * as _ from "lodash";

@Component({
    selector: "cde-compare-array",
    templateUrl: "./compareArray.component.html",
    styles: [`
        :host .arrayObj {
            border: 1px solid #ccc;
            padding: 9.5px;
            margin: 0 0 10px;
        }`]
})
export class CompareArrayComponent implements OnInit {
    @Input() older;
    @Input() newer;
    public compareArrayOption = [
        {
            label: "Form Elements",
            isEqual: function (a, b) {
                if (a.elementType === 'question' && b.elementType === 'question') {
                    if (_.isEmpty(a.diff)) a.diff = [];
                    if (_.isEmpty(b.diff)) b.diff = [];
                    let result = _.isEqual(a.question.cde.tinyId, b.question.cde.tinyId);
                    if (result) {
                        if (!a || !b) {
                            console.log('a');
                        }
                        if (!_.isEqual(a.label, b.label)) {
                            a.diff.push("label");
                            b.diff.push("label");
                            a.display = true;
                            b.display = true;
                        }
                        if (!_.isEqual(a.instructions.value, b.instructions.value)) {
                            a.diff.push("instructions.value");
                            b.diff.push("instructions.value");
                            a.display = true;
                            b.display = true;
                        }
                        if (!_.isEqual(a.question.uoms, b.question.uoms)) {
                            a.diff.push("question.uom");
                            b.diff.push("question.uom");
                            a.display = true;
                            b.display = true;
                        }
                        if (!_.isEqual(a.skipLogic.condition, b.skipLogic.condition)) {
                            a.diff.push("skipLogic.condition");
                            b.diff.push("skipLogic.condition");
                            a.display = true;
                            b.display = true;
                        }
                        if (!_.isEqual(a.question.answers, b.question.answers)) {
                            a.diff.push("question.answers");
                            b.diff.push("question.answers");
                            a.question.answers = JSON.stringify(a.question.answers);
                            b.question.answers = JSON.stringify(b.question.answers);
                            a.display = true;
                            b.display = true;
                        }
                    }
                    return result;
                }
                if (a.elementType === 'form' && b.elementType === 'form') {
                    if (_.isEmpty(a.diff)) a.diff = [];
                    if (_.isEmpty(b.diff)) b.diff = [];
                    let result = _.isEqual(a.inForm.form.tinyId, b.inForm.form.tinyId);
                    if (result) {
                        if (!a || !b) {
                            console.log('a');
                        }
                        if (!_.isEqual(a.instructions.value, b.instructions.value)) {
                            a.diff.push("instructions.value");
                            b.diff.push("instructions.value");
                            a.display = true;
                            b.display = true;
                        }
                        if (!_.isEqual(a.repeat, b.repeat)) {
                            a.diff.push("repeat");
                            b.diff.push("repeat");
                            a.display = true;
                            b.display = true;
                        }
                        if (!_.isEqual(a.skipLogic.condition, b.skipLogic.condition)) {
                            a.diff.push("skipLogic.condition");
                            b.diff.push("skipLogic.condition");
                            a.display = true;
                            b.display = true;
                        }
                    }
                    return result;
                }
                if (a.elementType === 'section' && b.elementType === 'section') {
                    if (_.isEmpty(a.diff)) a.diff = [];
                    if (_.isEmpty(b.diff)) b.diff = [];
                    let result = _.isEqual(a.sectionId, b.sectionId);
                    if (result) {
                        if (!a || !b) {
                            console.log('a');
                        }
                        if (!_.isEqual(a.instructions.value, b.instructions.value)) {
                            a.diff.push("instructions.value");
                            b.diff.push("instructions.value");
                            a.display = true;
                            b.display = true;
                        }
                        if (!_.isEqual(a.repeat, b.repeat)) {
                            a.diff.push("repeat");
                            b.diff.push("repeat");
                            a.display = true;
                            b.display = true;
                        }
                        if (!_.isEqual(a.skipLogic.condition, b.skipLogic.condition)) {
                            a.diff.push("skipLogic.condition");
                            b.diff.push("skipLogic.condition");
                            a.display = true;
                            b.display = true;
                        }
                    }
                    return result;
                }
            },
            property: "questions",
            data: [
                {label: 'Label', property: 'label'},
                {label: 'Form', property: 'inForm.form.tinyId', url: '/formView/?tinyId='},
                {label: 'CDE', property: 'question.cde.tinyId', url: '/deview/?tinyId='},
                {label: 'Unit of Measurement', property: 'question.uoms'},
                {label: 'repeat', property: 'repeat'},
                {label: 'Skip Logic', property: 'skipLogic.condition'},
                {label: 'Instruction', property: 'instructions.value'},
                {label: 'Answer', property: 'question.answers'}
            ],
            diff: []
        },
        {
            label: "Reference Documents",
            equal: function (a, b) {
                if (_.isEmpty(a.diff)) a.diff = [];
                if (_.isEmpty(b.diff)) b.diff = [];
                let result = _.isEqual(a.title, b.title);
                if (result) {
                    if (!a || !b) {
                        console.log('a');
                    }
                    if (!_.isEqual(a.uri, b.uri)) {
                        a.diff.push("uri");
                        b.diff.push("uri");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.providerOrg, b.providerOrg)) {
                        a.diff.push("providerOrg");
                        b.diff.push("providerOrg");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.languageCode, b.languageCode)) {
                        a.diff.push("languageCode");
                        b.diff.push("languageCode");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.document, b.document)) {
                        a.diff.push("document");
                        b.diff.push("document");
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            },
            property: "referenceDocuments",
            data: [
                {label: 'Title', property: 'title'},
                {label: 'URI', property: 'uri'},
                {label: 'Provider Org', property: 'providerOrg'},
                {label: 'Language Code', property: 'languageCode'},
                {label: 'Document', property: 'document'}
            ]
        },
        {
            label: "Naming",
            isEqual: function (a, b) {
                if (_.isEmpty(a.diff)) a.diff = [];
                if (_.isEmpty(b.diff)) b.diff = [];
                let result = _.isEqual(a.designation, b.designation);
                if (result) {
                    if (!_.isEqual(a.definition, b.definition)) {
                        a.diff.push("definition");
                        b.diff.push("definition");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.languageCode, b.languageCode)) {
                        a.diff.push("languageCode");
                        b.diff.push("languageCode");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.source, b.source)) {
                        a.diff.push("source");
                        b.diff.push("source");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.tags, b.tags)) {
                        a.diff.push("tags");
                        b.diff.push("tags");
                        a.tags = a.tags.map(t => t.tag).join(", ");
                        b.tags = b.tags.map(t => t.tag).join(", ");
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            },
            property: "naming",
            data: [
                {label: 'Name', property: 'designation'},
                {label: 'Definition', property: 'definition'},
                {label: 'Tags', property: 'tags', array: true}
            ]
        },
        {
            label: "Properties",
            isEqual: function (a, b) {
                if (_.isEmpty(a.diff)) a.diff = [];
                if (_.isEmpty(b.diff)) b.diff = [];
                let result = _.isEqual(a.key, b.key);
                if (result) {
                    if (!a || !b) {
                        console.log('a');
                    }
                    if (!_.isEqual(a.value, b.value)) {
                        a.diff.push("value");
                        b.diff.push("value");
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            },
            property: "properties",
            data: [
                {label: 'Key', property: 'key'},
                {label: 'Value', property: 'value'}
            ]
        },
        {
            label: "Value List",
            isEqual: function (a, b) {
                if (_.isEmpty(a.diff)) a.diff = [];
                if (_.isEmpty(b.diff)) b.diff = [];
                let result = _.isEqual(a.valueMeaningName, b.valueMeaningName);
                if (result) {
                    if (!a || !b) {
                        console.log('a');
                    }
                    if (!_.isEqual(a.permissibleValue, b.permissibleValue)) {
                        a.diff.push("permissibleValue");
                        b.diff.push("permissibleValue");
                        a.display = true;
                        b.display = true;
                    }
                    if (!_.isEqual(a.valueMeaningDefinition, b.valueMeaningDefinition)) {
                        a.diff.push("valueMeaningDefinition");
                        b.diff.push("valueMeaningDefinition");
                        a.display = true;
                        b.display = true;
                    }
                }
                return result;
            },
            property: "valueDomain.permissibleValues",
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
            label: "Concepts",
            isEqual: function (a, b) {
                return _.isEqual(a, b);
            },
            property: "concepts",
            data: [
                {label: "Name", property: 'name'},
                {label: "Origin", property: 'origin'},
                {label: "Origin Id", property: 'originId'}
            ],
            diff: []
        }
    ];


    constructor(public compareService: CompareService) {
    }

    ngOnInit(): void {
        this.older.questions = [];
        this.flatFormQuestions(this.older, this.older.questions);
        if (!this.older.property) this.older.property = {concept: []};
        if (!this.older.objectClass) this.older.objectClass = {concept: []};
        if (!this.older.dataElementConcept) this.older.dataElementConcept = {concept: []};
        this.older.concepts = _.concat(_.concat(this.older.property.concepts, this.older.objectClass.concepts), this.older.dataElementConcept.concepts);
        this.newer.questions = [];
        this.flatFormQuestions(this.newer, this.newer.questions);
        if (!this.newer.property) this.newer.property = {concept: []};
        if (!this.newer.objectClass) this.newer.objectClass = {concept: []};
        if (!this.newer.dataElementConcept) this.newer.dataElementConcept = {concept: []};
        this.newer.concepts = _.concat(_.concat(this.newer.property.concepts, this.newer.objectClass.concepts), this.newer.dataElementConcept.concepts);
        this.compareService.doCompareArray(this.newer, this.older, this.compareArrayOption);
        console.log('a');
    }

    fixFormElement(f) {
        if (!f.skipLogic) f.skipLogic = {};
        if (!f.instructions) f.instructions = {};
    }

    flatFormQuestions(fe, questions) {
        let index = 0;
        if (fe.formElements !== undefined) {
            _.forEach(fe.formElements, e => {
                if (e.elementType && e.elementType === 'question') {
                    let questionCopy = _.cloneDeep(e);
                    this.fixFormElement(questionCopy);
                    if (questionCopy.hideLabel) questionCopy.label = "";
                    questions.push(questionCopy);
                } else if (e.elementType && e.elementType === 'form') {
                    let formCopy = _.cloneDeep(e);
                    this.fixFormElement(formCopy);
                    questions.push(formCopy);
                } else if (e.elementType && e.elementType === 'section') {
                    let sectionCopy = _.cloneDeep(e);
                    this.fixFormElement(sectionCopy);
                    sectionCopy["sectionId"] = "section_" + index;
                    index++;
                    questions.push(sectionCopy);
                    this.flatFormQuestions(e, questions);
                } else {
                    console.log("Unknown element type: " + e.elementType);
                }
            });
        }
    };
}
