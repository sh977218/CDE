import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Host, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'angular-tree-component';
import _isEqual from 'lodash/isEqual';
import _toString from 'lodash/toString';

import { FormDescriptionComponent } from 'form/public/tabs/description/formDescription.component';
import { FormService } from 'nativeRender/form.service';
import { DataElement } from 'shared/de/dataElement.model';
import { FormElement, FormQuestion } from 'shared/form/form.model';
import { isSubForm } from 'shared/form/formShared';


@Component({
    selector: 'cde-form-description-question',
    templateUrl: 'formDescriptionQuestion.component.html',
    styles: [`
        .outdated-bg {
            background-color: #ffecc5;
            border: 1px;
            border-radius: 10px;
        }
    `]
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
        this.isSubForm = isSubForm(this.node);
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
        } else if (datatype === 'Date') {
            return '(Date)';
        } else return '';
    }

    isScore(formElt) {
        return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
    }

    openUpdateCdeVersion(question) {
        this.http.get<DataElement>('/de/' + question.question.cde.tinyId).subscribe(response => {
            this.formService.convertCdeToQuestion(response, newQuestion => {
                this.http.get<DataElement>('/de/' + newQuestion.question.cde.tinyId).subscribe(newCde => {
                    let oldUrl = '/de/' + question.question.cde.tinyId + '/version/' + question.question.cde.version;
                    this.http.get<DataElement>(oldUrl).subscribe(oldCde => {
                        this.openUpdateCdeVersionMerge(newQuestion, question, newCde, oldCde);
                    });
                });
            });
        });
    }

    openUpdateCdeVersionMerge(newQuestion, currentQuestion, newCde, oldCde) {
        newQuestion.instructions = currentQuestion.instructions;
        newQuestion.question.editable = currentQuestion.question.editable;
        newQuestion.question.invisible = currentQuestion.question.invisible;
        newQuestion.question.multiselect = currentQuestion.question.multiselect;
        newQuestion.question.required = currentQuestion.question.required;
        newQuestion.repeat = currentQuestion.repeat;
        newQuestion.skipLogic = currentQuestion.skipLogic;
        if (newCde.naming.some(n => n.designation === currentQuestion.label)) {
            newQuestion.label = currentQuestion.label;
        }
        if (oldCde.valueDomain.datatypeDate.precision !== currentQuestion.question.datatypeDate.precision) {
            newQuestion.question.datatypeDate.precision = currentQuestion.question.datatypeDate.precision;
        }

        let modal: any = {
            currentQuestion: currentQuestion,
            newQuestion: newQuestion
        };
        modal.bCde = true;
        modal.bLabel = !_isEqual(newCde.naming, oldCde.naming);
        modal.bDatatype = currentQuestion.question.datatype !== newQuestion.question.datatype;
        modal.bDefault = _toString(currentQuestion.question.defaultAnswer) !== _toString(newQuestion.question.defaultAnswer);
        modal.bUom = !_isEqual(currentQuestion.question.unitsOfMeasure, newQuestion.question.unitsOfMeasure);

        switch (newQuestion.question.datatype) {
            case 'Value List':
                if (currentQuestion.question.datatype === 'Value List') {
                    modal.bValuelist = !_isEqual(currentQuestion.question.cde.permissibleValues,
                        newQuestion.question.cde.permissibleValues);
                    if (!modal.bValuelist) newQuestion.question.answers = currentQuestion.question.answers;

                    if (currentQuestion.question.defaultAnswer && newQuestion.question.answers.filter(
                            a => a.permissibleValue === currentQuestion.question.defaultAnswer).length > 0) {
                        newQuestion.question.defaultAnswer = currentQuestion.question.defaultAnswer;
                    }
                } else {
                    modal.bValuelist = true;
                }
                break;
            case 'Date':
                if (newCde.valueDomain.datatypeDate.precision !== oldCde.valueDomain.datatypeDate.precision  &&
                    newCde.valueDomain.datatypeDate.precision !== currentQuestion.question.datatypeDate.precision) {
                    modal.bDatePrecision = true;
                }
                break;
            case 'Number':
                if (currentQuestion.question.datatype === 'Number' &&
                    currentQuestion.question.datatypeNumber && newQuestion.question.datatypeNumber) {
                    modal.bNumberMin = currentQuestion.question.datatypeNumber.minValue
                        !== newQuestion.question.datatypeNumber.minValue;
                    modal.bNumberMax = currentQuestion.question.datatypeNumber.maxValue
                        !== newQuestion.question.datatypeNumber.maxValue;
                } else {
                    modal.bNumberMin = modal.bNumberMax = true;
                }
                break;
        }

        this.updateCdeVersion =  modal;
        this.modalService.open(this.updateCdeVersionTmpl, {size: 'lg'}).result.then(() => {
            currentQuestion.question = newQuestion.question;
            currentQuestion.label = newQuestion.label;
            this.stageElt.emit();
        }, () => {});
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }
}
