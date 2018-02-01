import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Host, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'angular-tree-component';
import _isEqual from 'lodash/isEqual';
import _toString from 'lodash/toString';

import { FormElement, FormQuestion } from 'core/form.model';
import { DataElement } from 'core/dataElement.model';
import { FormDescriptionComponent } from "form/public/tabs/description/formDescription.component";
import { FormService } from 'nativeRender/form.service';


@Component({
    selector: 'cde-form-description-question',
    templateUrl: 'formDescriptionQuestion.component.html',
    styles: [`
        .outdated-bg {
            background-color: #ffecc5;
            border: 1px;
            border-radius: 10px;
        }
        `
    ]
})
export class FormDescriptionQuestionComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() index;
    @Input() node: TreeNode;
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('updateCdeVersionTmpl') updateCdeVersionTmpl: NgbModalModule;
    isSubForm = false;
    parent: FormElement;
    question: FormQuestion;
    updateCdeVersion: any;

    ngOnInit() {
        this.question = this.node.data;
        this.parent = this.node.parent.data;
        this.isSubForm = FormService.isSubForm(this.node);
    }

    constructor(
        @Host() public formDescriptionComponent: FormDescriptionComponent,
        public formService: FormService,
        private http: HttpClient,
        public modalService: NgbModal
    ) {
    }

    editQuestion(question) {
        if (!this.isSubForm && this.canEdit) {
            question.edit = !question.edit;
            this.formDescriptionComponent.setCurrentEditing(this.parent.formElements, question, this.index);
        }
    }

    hoverInQuestion(question) {
        if (!this.isSubForm && this.canEdit) {
            question.hover = true;
        }
    }

    hoverOutQuestion(question) {
        if (!this.isSubForm && this.canEdit) {
            question.hover = false;
        }
    }

    getDatatypeLabel(question) {
        let datatype = question.question.datatype;
        if (!datatype) return '';
        else if (datatype === 'Number') {
            return '(Number)';
        } else if (datatype.toLowerCase() === 'date') {
            return '(Date)';
        } else return '';
    }

    isScore(formElt) {
        return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
    }

    openUpdateCdeVersion(question) {
        this.http.get<DataElement>('/de/' + question.question.cde.tinyId)
            .subscribe(response => {
                this.formService.convertCdeToQuestion(response, newQuestion => {
                    this.updateCdeVersion = (() => {
                        let modal: any = {
                            currentQuestion: question,
                            newQuestion: newQuestion
                        };
                        let currentQuestion = question;

                        newQuestion.question.editable = currentQuestion.question.editable;
                        newQuestion.question.instructions = currentQuestion.question.instructions;
                        newQuestion.question.invisible = currentQuestion.question.invisible;
                        newQuestion.question.multiselect = currentQuestion.question.multiselect;
                        newQuestion.question.required = currentQuestion.question.required;
                        newQuestion.question.skipLogic = currentQuestion.question.skipLogic;
                        newQuestion.repeat = currentQuestion.repeat;

                        this.http.get<DataElement>('/de/' + newQuestion.question.cde.tinyId)
                            .subscribe(newCde => {
                                let cdeUrl = '/de/' + currentQuestion.question.cde.tinyId;
                                if (currentQuestion.question.cde.version && currentQuestion.question.cde.version.length > 0) {
                                    cdeUrl = cdeUrl + '/version/' + currentQuestion.question.cde.version;
                                }
                                this.http.get<DataElement>(cdeUrl).subscribe(oldCde => {
                                    modal.bLabel = !_isEqual(newCde.naming, oldCde.naming);
                                });
                                let found = false;
                                newCde.naming.forEach(result => {
                                    if (result.designation === currentQuestion.label) found = true;
                                });
                                if (found) newQuestion.label = currentQuestion.label;
                            });

                        modal.bCde = true;
                        modal.bDatatype = currentQuestion.question.datatype !== newQuestion.question.datatype;
                        modal.bUom = !_isEqual(currentQuestion.question.uoms, newQuestion.question.uoms);

                        if (newQuestion.question.datatype === 'Number') {
                            if (currentQuestion.question.datatype === 'Number' &&
                                currentQuestion.question.datatypeNumber &&
                                newQuestion.question.datatypeNumber) {
                                modal.bNumberMin = currentQuestion.question.datatypeNumber.minValue
                                    !== newQuestion.question.datatypeNumber.minValue;
                                modal.bNumberMax = currentQuestion.question.datatypeNumber.maxValue
                                    !== newQuestion.question.datatypeNumber.maxValue;
                            } else {
                                modal.bNumberMin = modal.bNumberMax = true;
                            }
                        }
                        if (newQuestion.question.datatype === 'Value List') {
                            if (currentQuestion.question.datatype === 'Value List') {
                                modal.bValuelist = !_isEqual(currentQuestion.question.cde.permissibleValues,
                                    newQuestion.question.cde.permissibleValues);
                                if (!modal.bValuelist) newQuestion.question.answers = currentQuestion.question.answers;

                                if (currentQuestion.question.defaultAnswer && newQuestion.question.answers.filter(a => a.permissibleValue === currentQuestion.question.defaultAnswer).length > 0) {
                                    newQuestion.question.defaultAnswer = currentQuestion.question.defaultAnswer;
                                }
                            } else {
                                modal.bValuelist = true;
                            }
                        }
                        modal.bDefault = _toString(currentQuestion.question.defaultAnswer) !== _toString(newQuestion.question.defaultAnswer);

                        return modal;
                    })();

                    this.modalService.open(this.updateCdeVersionTmpl, {size: 'lg'}).result.then(() => {
                        question.question = newQuestion.question;
                        question.label = newQuestion.label;
                        this.stageElt.emit();
                    }, () => {
                    });
                });
            });
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }
}
