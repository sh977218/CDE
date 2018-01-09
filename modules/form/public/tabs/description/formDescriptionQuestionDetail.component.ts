import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { Http, Response } from "@angular/http";
import { NgbModal, NgbModalModule, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TreeNode } from "angular-tree-component";
import _isEqual from 'lodash/isEqual';
import { Observable } from "rxjs/Observable";

import { FormElement, FormQuestion, PermissibleFormValue, SkipLogic } from 'core/form.model';
import { FormattedValue } from 'core/models.model';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';


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
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();
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
                public skipLogicValidateService: SkipLogicValidateService,
                private ucumService: UcumService) {
        this.nameSelectModal.okSelect = (naming = null) => {
            if (!naming) {
                this.nameSelectModal.question.label = "";
                this.nameSelectModal.question.hideLabel = true;
            }
            else {
                this.nameSelectModal.updateSkipLogic = SkipLogicValidateService.checkAndUpdateLabel(
                    this.nameSelectModal.section, this.nameSelectModal.question.label, naming.designation);
                this.nameSelectModal.question.label = naming.designation;
                this.nameSelectModal.question.hideLabel = false;
            }
            this.nameSelectModalRef.close();
        };
    }

    checkAnswers(answers) {
        let newAnswers = (Array.isArray(answers.value) ? answers.value.filter(answer => answer !== "") : []);
        if (!_isEqual(this.answersSelected, newAnswers)) {
            this.question.question.answers = this.question.question.cde.permissibleValues
                .filter(a => newAnswers.indexOf(a.permissibleValue) > -1) as PermissibleFormValue[];
            this.answersSelected = this.question.question.answers.map(a => a.permissibleValue);
            this.stageElt.emit();
        }
    }

    checkUom(uoms) {
        let newUoms = (Array.isArray(uoms.value) ? uoms.value.filter(uom => uom !== "") : []);
        if (!_isEqual(this.question.question.uoms, newUoms)) {
            this.question.question.uoms = newUoms;
            this.stageElt.emit();
            this.validateUoms(this.question.question);
        }
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
            this.skipLogicValidateService.getTypeaheadOptions(term, this.parent, this.question)
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
        let url = "/de/" + this.nameSelectModal.cde.tinyId;
        if (this.nameSelectModal.cde.version) url += "/version/" + this.nameSelectModal.cde.version;
        this.http.get(url).map((res: Response) => res.json())
            .subscribe((response) => {
                this.nameSelectModal.cde = response;
            }, () => {
                this.nameSelectModal.cde = "error";
            });
        this.nameSelectModal.updateSkipLogic = SkipLogicValidateService.checkAndUpdateLabel(section,
            this.nameSelectModal.question.label);

        this.nameSelectModalRef = this.modalService.open(this.formDescriptionNameSelectTmpl, {size: "lg"});
        this.nameSelectModalRef.result.then(() => this.stageElt.emit(), () => {});
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }

    slOptionsRetrigger() {
        if (this.slInput)
            setTimeout(() => {
                this.slInput.nativeElement.dispatchEvent(FormDescriptionQuestionDetailComponent.inputEvent);
            }, 0);
    }

    typeaheadSkipLogic(parent, fe, event) {
        if (fe.skipLogic && fe.skipLogic.condition !== event) {
            this.skipLogicValidateService.typeaheadSkipLogic(parent, fe, event);
            this.stageElt.emit();
        }
    }

    validateUoms(question) {
        question.uomsValid = [];
        this.ucumService.validateUnits(question.uoms, (errors, units) => {
            question.uoms.forEach((uom, i, uoms) => {
                question.uomsValid[i] = errors[i];
            });
        });
    }

    static inputEvent = new Event('input');
}
