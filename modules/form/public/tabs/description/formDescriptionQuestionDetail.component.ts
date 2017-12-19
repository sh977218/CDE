import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { Http, Response } from "@angular/http";
import { NgbModal, NgbModalModule, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import ucum from 'ucum.js';
import { Observable } from "rxjs/Observable";

import { TreeNode } from "angular-tree-component";
import { SkipLogicService } from 'nativeRender/skipLogic.service';
import { CdeForm, FormElement, FormQuestion, SkipLogic } from 'core/form.model';
import { FormattedValue } from 'core/models.model';

@Component({
    selector: "cde-form-description-question-detail",
    templateUrl: "formDescriptionQuestionDetail.component.html"
})
export class FormDescriptionQuestionDetailComponent {
    @Input() canEdit: boolean = false;

    @Input() set node(node: TreeNode) {
        this.question = node.data;
        this.parent = node.parent.data;
        if (!this.question.instructions)
            this.question.instructions = new FormattedValue;
        if (!this.question.skipLogic)
            this.question.skipLogic = new SkipLogic;
        if (!this.question.question.uoms)
            this.question.question.uoms = [];
        if (this.question.question.uoms) this.validateUoms(this.question.question);
    };

    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onEltChange: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild("formDescriptionNameSelectTmpl") formDescriptionNameSelectTmpl: NgbModalModule;
    @ViewChild("formDescriptionQuestionTmpl") formDescriptionQuestionTmpl: TemplateRef<any>;
    @ViewChild("formDescriptionQuestionEditTmpl") formDescriptionQuestionEditTmpl: TemplateRef<any>;
    @ViewChild("slInput") slInput: ElementRef;

    answersOptions: any = {
        allowClear: true,
        multiple: true,
        closeOnSelect: true,
        placeholder: {
            id: "",
            placeholder: "Leave blank to ..."
        },
        tags: true,
        language: {
            noResults: () => {
                return "No Answer List entries are listed on the CDE.";
            }
        }
    };
    namingTags = [];
    answersSelected: Array<string>;
    nameSelectModal: any = {};
    nameSelectModalRef: NgbModalRef;
    question: FormQuestion;
    parent: FormElement;
    uomOptions: any = {
        multiple: true,
        tags: true,
        language: {
            noResults: () => {
                return "No Units of Measure are listed on the CDE. Type in more followed by ENTER.";
            }
        }
    };
    uomVersion = 0;

    constructor(private http: Http,
                public modalService: NgbModal,
                public skipLogicService: SkipLogicService) {
        this.nameSelectModal.checkAndUpdateLabel = (section, doUpdate = false, selectedNaming = false) => {
            section.formElements.forEach((fe) => {
                if (fe.skipLogic && fe.skipLogic.condition) {
                    let updateSkipLogic = false;
                    let tokens = SkipLogicService.tokenSplitter(fe.skipLogic.condition);
                    tokens.forEach((token, i) => {
                        if (i % 2 === 0 && token === '"' + this.nameSelectModal.question.label + '"') {
                            this.nameSelectModal.updateSkipLogic = true;
                            updateSkipLogic = true;
                            if (doUpdate && selectedNaming)
                                tokens[i] = '"' + selectedNaming + '"';
                        } else if (i % 2 === 0 && token !== this.nameSelectModal.question.label)
                            tokens[i] = '"' + tokens[i] + '"';
                    });
                    if (doUpdate && updateSkipLogic) {
                        fe.skipLogic.condition = tokens.join('');
                        fe.updatedSkipLogic = true;
                    }
                }
            });
        };
        this.nameSelectModal.okSelect = (naming = null) => {
            if (!naming) {
                this.nameSelectModal.question.label = "";
                this.nameSelectModal.question.hideLabel = true;
            }
            else {
                this.nameSelectModal.checkAndUpdateLabel(this.nameSelectModal.section, true, naming.designation);
                this.nameSelectModal.question.label = naming.designation;
                this.nameSelectModal.question.hideLabel = false;
            }
            this.nameSelectModalRef.close();
        };
    }

    checkAnswers(answers) {
        let newAnswers = (Array.isArray(answers.value) ? answers.value.filter(answer => answer !== "") : []);
        if (!_.isEqual(this.answersSelected, newAnswers)) {
            this.question.question.answers = this.question.question.cde.permissibleValues.filter(a => newAnswers.indexOf(a.permissibleValue) > -1);
            this.answersSelected = this.question.question.answers.map(a => a.permissibleValue);
            this.onEltChange.emit();
        }
    }

    validateUoms(question) {
        function matchUnits(a, aKeys, question, index) {
            let b = ucum.canonicalize(question.uoms[index]).units;
            question.uomsValid[index] = question.uomsValid[index]
                || aKeys.concat(Object.keys(b)).every(u => a[u] && b[u] && a[u] === b[u]);
        }

        let baseUnits;
        let baseUnitsKeys;
        let delayedUnits = [];
        question.uomsValid = [];
        question.uoms.forEach((uom, i) => {
            this.http.get('https://clin-table-search.lhc.nlm.nih.gov/api/ucum/v3/search?q=is_simple:true%20AND%20category:Clinical&df=cs_code,name,guidance&authenticity_token=&terms=' + encodeURIComponent(uom))
                .map(r => r.json())
                .subscribe(r => {
                    r[3].forEach(unit => {
                        if (unit[0] === uom || unit[1] === uom) {
                            if (unit[0] !== uom) {
                                question.uoms[i] = unit[0];
                                this.uomVersion++;
                                this.onEltChange.emit();
                            }

                            let valid = true;
                            try {
                                ucum.parse(1, question.uoms[i]);
                            } catch (err) {
                                valid = false;
                            }
                            if (valid) {
                                if (i === 0) {
                                    baseUnits = ucum.canonicalize(question.uoms[i]).units;
                                    baseUnitsKeys = Object.keys(baseUnits);
                                    question.uomsValid[i] = question.uomsValid[i] || valid;

                                    if (delayedUnits.length)
                                        delayedUnits.forEach(u => matchUnits(baseUnits, baseUnitsKeys, question, u));
                                } else {
                                    if (baseUnits)
                                        matchUnits(baseUnits, baseUnitsKeys, question, i);
                                    else
                                        delayedUnits.push(i);
                                }
                            } else {
                                question.uomsValid[i] = question.uomsValid[i] || valid;
                            }
                        } else {
                            question.uomsValid[i] = question.uomsValid[i] || false;
                        }
                    });
                });
        });
    }

    checkUom(uoms) {
        let newUoms = (Array.isArray(uoms.value) ? uoms.value.filter(uom => uom !== "") : []);
        if (!_.isEqual(this.question.question.uoms, newUoms)) {
            this.question.question.uoms = newUoms;
            this.onEltChange.emit();
        }
        this.validateUoms(this.question.question);
    }

    getRepeatLabel(fe) {
        if (!fe.repeat)
            return "";
        if (fe.repeat[0] === "F")
            return "over First Question";
        return parseInt(fe.repeat) + " times";
    }

    getSkipLogicOptions = (text$: Observable<string>) =>
        text$.debounceTime(300).map(term =>
            this.skipLogicService.getCurrentOptions(term, this.parent.formElements, this.question, this.parent.formElements.indexOf(this.question))
        );

    getTemplate() {
        return (this.canEdit && this.question.edit ? this.formDescriptionQuestionEditTmpl : this.formDescriptionQuestionTmpl);
    }

    getAnswersData() {
        return this.question.question.cde.permissibleValues.map(answer => {
            return {id: answer.permissibleValue, text: answer.valueMeaningName};
        });
    }

    getAnswersValue() {
        if (!this.answersSelected)
            this.answersSelected = this.question.question.answers.map(a => a.permissibleValue);
        return this.answersSelected;
    }

    getUoms() {
        return this.question.question.uoms.map(uom => {
            return {id: uom, text: uom};
        });
    }

    isScore(formElt) {
        return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
    }

    openNameSelect(question, section) {
        this.nameSelectModal.section = section;
        this.nameSelectModal.question = question;
        this.nameSelectModal.cde = question.question.cde;
        if (this.nameSelectModal.cde.tinyId) {
            let url = "/de/" + this.nameSelectModal.cde.tinyId;
            if (this.nameSelectModal.cde.version) url += "/version/" + this.nameSelectModal.cde.version;
            this.http.get(url).map((res: Response) => res.json())
                .subscribe(response => this.nameSelectModal.cde = response,
                    () => this.nameSelectModal.cde = "error");
            this.nameSelectModal.checkAndUpdateLabel(section);
        }
        this.nameSelectModalRef = this.modalService.open(this.formDescriptionNameSelectTmpl, {size: "lg"});
        this.nameSelectModalRef.result.then(() => this.onEltChange.emit(), () => {
        });
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.onEltChange.emit();
    }

    slOptionsRetrigger() {
        if (this.slInput)
            setTimeout(() => {
                this.slInput.nativeElement.dispatchEvent(FormDescriptionQuestionDetailComponent.inputEvent);
            }, 0);
    }

    validateSkipLogic(skipLogic, previousQuestions, item) {
        let oldSkipLogic = skipLogic;
        if (oldSkipLogic && oldSkipLogic.condition !== item) {
            let validateSkipLogicResult = this.skipLogicService.validateSkipLogic(skipLogic, previousQuestions, item);
            if (validateSkipLogicResult)
                this.onEltChange.emit();
            else
                this.isFormValid.emit(false);
        }
    }

    static inputEvent = new Event('input');


    public options: Select2Options = {
        multiple: true,
        tags: true,
        language: {
            noResults: () => {
                return "No Tags found, Tags are managed in Org Management > List Management";
            }
        }
    };

    changedTags(name, data: { value: string[] }) {
        name.tags = data.value;
        this.onEltChange.emit();
    }

    addNamingToNewCde() {
        this.question.question.cde.naming.push({designation: '', definition: '', tags: []});
    }
}
