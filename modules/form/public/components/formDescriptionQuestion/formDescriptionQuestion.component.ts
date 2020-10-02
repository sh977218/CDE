import { Component, EventEmitter, Host, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TreeNode } from '@circlon/angular-tree-component';
import { DataElementService } from 'cde/public/dataElement.service';
import { FormDescriptionComponent } from 'form/public/components/formDescription/formDescription.component';
import _isEqual from 'lodash/isEqual';
import _noop from 'lodash/noop';
import _toString from 'lodash/toString';
import { FormService } from 'nativeRender/form.service';
import { DataElement, DataType } from 'shared/de/dataElement.model';
import { isScore } from 'shared/form/fe';
import { FormElement, FormQuestion, QuestionValueList } from 'shared/form/form.model';

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
    @Input() canEdit = false;
    @Input() index!: number;
    @Input() node!: TreeNode;
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('updateCdeVersionTmpl', {static: true}) updateCdeVersionTmpl!: TemplateRef<any>;
    isScore = isScore;
    isSubForm = false;
    parent!: FormElement;
    question!: FormQuestion;
    updateCdeVersion: any;

    constructor(
        @Host() public formDescriptionComponent: FormDescriptionComponent,
        public dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.question = this.node.data;
        this.parent = this.node.parent.data;
        this.isSubForm = FormDescriptionComponent.isSubForm(this.node);
    }

    editQuestion(q: FormQuestion) {
        if (!this.isSubForm && this.canEdit) {
            q.edit = !q.edit;
            this.formDescriptionComponent.setCurrentEditing(this.parent.formElements, q, this.index);
        }
    }

    hoverInQuestion(q: FormQuestion) {
        if (!this.isSubForm && this.canEdit) {
            q.hover = true;
        }
    }

    hoverOutQuestion(q: FormQuestion) {
        if (!this.isSubForm && this.canEdit) {
            q.hover = false;
        }
    }

    getDatatypeLabel(q: FormQuestion) {
        const datatype: DataType | undefined = q.question.datatype;
        switch (datatype) {
            case 'Date':
                return '(Date)';
            case 'Dynamic Code List':
                return '(Dynamic Code List)';
            case 'Geo Location':
                return '(Geo Location)';
            case 'Number':
                return '(Number)';
            default:
                return '';
        }
    }

    openUpdateCdeVersion(question: FormQuestion) {
        DataElementService.fetchDe(question.question.cde.tinyId).then(newCde => {
            const oldVersion = question.question.cde.version ? question.question.cde.version : '';
            DataElementService.fetchDe(question.question.cde.tinyId, oldVersion).then(oldCde => {
                FormService.convertCdeToQuestion(newCde, newQuestion => {
                    if (newQuestion) {
                        this.openUpdateCdeVersionMerge(newQuestion, question, newCde, oldCde);
                    }
                });
            });
        });
    }

    openUpdateCdeVersionMerge(newQuestion: FormQuestion, currentQuestion: FormQuestion, newCde: DataElement, oldCde: DataElement) {
        newQuestion.instructions = currentQuestion.instructions;
        newQuestion.question.editable = currentQuestion.question.editable;
        newQuestion.question.invisible = currentQuestion.question.invisible;
        if (currentQuestion.question.datatype === 'Value List') {
            (newQuestion.question as QuestionValueList).displayAs = currentQuestion.question.displayAs;
            (newQuestion.question as QuestionValueList).multiselect = currentQuestion.question.multiselect;
        }
        newQuestion.question.required = currentQuestion.question.required;
        newQuestion.question.unitsOfMeasure =
            newQuestion.question.unitsOfMeasure.length && currentQuestion.question.unitsOfMeasure.filter(
                u => newQuestion.question.unitsOfMeasure[0].code === u.code && !u.system
            ).length
                ? currentQuestion.question.unitsOfMeasure
                : newQuestion.question.unitsOfMeasure.concat(currentQuestion.question.unitsOfMeasure);
        newQuestion.repeat = currentQuestion.repeat;
        newQuestion.skipLogic = currentQuestion.skipLogic;
        if (newCde.designations.some(n => n.designation === currentQuestion.label)) {
            newQuestion.label = currentQuestion.label;
        }

        const modal: any = {
            currentQuestion,
            newQuestion
        };
        modal.bCde = true;
        modal.bLabel = !_isEqual(newCde.designations, oldCde.designations);
        modal.bDatatype = currentQuestion.question.datatype !== newQuestion.question.datatype;
        modal.bDefault = _toString(currentQuestion.question.defaultAnswer) !== _toString(newQuestion.question.defaultAnswer);
        modal.bUom = !_isEqual(currentQuestion.question.unitsOfMeasure, newQuestion.question.unitsOfMeasure);

        switch (newQuestion.question.datatype) {
            case 'Value List':
                if (currentQuestion.question.datatype === 'Value List') {
                    modal.bValuelist = !_isEqual(currentQuestion.question.cde.permissibleValues,
                        newQuestion.question.cde.permissibleValues);
                    if (!modal.bValuelist) { newQuestion.question.answers = currentQuestion.question.answers; }

                    if (currentQuestion.question.defaultAnswer && newQuestion.question.answers.filter(
                        a => a.permissibleValue === currentQuestion.question.defaultAnswer).length > 0) {
                        newQuestion.question.defaultAnswer = currentQuestion.question.defaultAnswer;
                    }
                } else {
                    modal.bValuelist = true;
                }
                break;
            case 'Date':
                if (currentQuestion.question.datatype === 'Date' && currentQuestion.question.datatypeDate) {
                    if (!newQuestion.question.datatypeDate) { newQuestion.question.datatypeDate = {}; }
                    newQuestion.question.datatypeDate.precision = currentQuestion.question.datatypeDate.precision;
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

        this.updateCdeVersion = modal;
        this.dialog.open<boolean>(this.updateCdeVersionTmpl, {width: '1000px'}).afterClosed().subscribe(res => {
            if (res) {
                currentQuestion.question = newQuestion.question;
                currentQuestion.label = newQuestion.label;
                this.stageElt.emit();
            }
        }, _noop);
    }

    removeNode(node: TreeNode) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }
}
