import { Component, EventEmitter, Host, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TreeNode } from '@ali-hm/angular-tree-component';
import { FormDescriptionComponent } from 'form/formDescription/formDescription.component';
import { DataType } from 'shared/de/dataElement.model';
import { isScore } from 'shared/form/fe';
import { FormElement, FormQuestion } from 'shared/form/form.model';
import { FormUpdateCdeVersionModalComponent } from 'form/form-update-cde-version-modal/form-update-cde-version-modal.component';

@Component({
    selector: 'cde-form-description-question',
    templateUrl: './formDescriptionQuestion.component.html',
})
export class FormDescriptionQuestionComponent implements OnInit {
    @Input() canEdit = false;
    @Input() index!: number;
    @Input() node!: TreeNode;
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('updateCdeVersionTmpl', { static: true }) updateCdeVersionTmpl!: TemplateRef<any>;
    isScore = isScore;
    isSubForm = false;
    parent!: FormElement;
    question!: FormQuestion;

    constructor(@Host() public formDescriptionComponent: FormDescriptionComponent, public dialog: MatDialog) {}

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

    removeNode(node: TreeNode) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }

    openUpdateCdeVersionModal(currentQuestion: FormQuestion) {
        const data = currentQuestion;
        this.dialog
            .open<FormUpdateCdeVersionModalComponent, FormQuestion, FormQuestion>(FormUpdateCdeVersionModalComponent, {
                width: '1000px',
                data,
            })
            .afterClosed()
            .subscribe(newQuestion => {
                if (newQuestion) {
                    currentQuestion.question = newQuestion.question;
                    currentQuestion.label = newQuestion.label;
                    this.stageElt.emit();
                }
            });
    }
}
