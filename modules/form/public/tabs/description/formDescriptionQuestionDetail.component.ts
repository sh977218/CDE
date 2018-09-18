import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatChipInputEvent, MatDialog } from '@angular/material';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'angular-tree-component';
import _clone from 'lodash/clone';
import { Observable } from 'rxjs/Observable';
import { debounceTime, map } from 'rxjs/operators';

import { AlertService } from '_app/alert.service';
import { DataTypeService } from 'core/dataType.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { QuestionAnswerEditContentComponent } from 'form/public/tabs/description/questionAnswerEditContent.component';
import { SelectQuestionLabelComponent } from 'form/public/tabs/description/selectQuestionLabel.component';
import { CodeAndSystem, FormattedValue } from 'shared/models.model';
import { FormElement, FormQuestion, SkipLogic } from 'shared/form/form.model';
import { ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'cde-form-description-question-detail',
    templateUrl: 'formDescriptionQuestionDetail.component.html',
    styles: [`
        mat-form-field {
            margin-left: 1px;
            margin-right: 1px;
        }

        .green {
            color: green
        }

        .blue {
            color: blue
        }
    `]
})
export class FormDescriptionQuestionDetailComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() elt;

    @Input() set node(node: TreeNode) {
        this.question = node.data;
        this.parent = node.parent.data;
        if (!this.question.instructions) {
            this.question.instructions = new FormattedValue;
        }
        if (!this.question.skipLogic) {
            this.question.skipLogic = new SkipLogic;
        }
        if (!this.question.question.unitsOfMeasure) {
            this.question.question.unitsOfMeasure = [];
        }
        if (this.question.question.unitsOfMeasure) {
            this.ucumService.validateUoms(this.question.question);
        }
    }

    @Output() onEltChange: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('formDescriptionQuestionTmpl') formDescriptionQuestionTmpl: TemplateRef<any>;
    @ViewChild('formDescriptionQuestionEditTmpl') formDescriptionQuestionEditTmpl: TemplateRef<any>;
    @ViewChild('slInput') slInput: ElementRef;
    answerListItems = [];
    dataTypeList = [];
    defaultAnswerListItems = [];
    getSkipLogicOptions = ((text$: Observable<string>) => text$.pipe(
        debounceTime(300),
        map(term => this.skipLogicValidateService.getTypeaheadOptions(term, this.parent, this.question))
    ));
    static inputEvent = new Event('input');
    newUom = '';
    newUomSystem = 'UCUM';
    question: FormQuestion;
    parent: FormElement;
    tag = [];
    readonly separatorKeysCodes: number[] = [ENTER];

    constructor(private alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal,
                public dialog: MatDialog,
                private orgHelperService: OrgHelperService,
                public skipLogicValidateService: SkipLogicValidateService,
                private ucumService: UcumService) {
        this.dataTypeList = DataTypeService.dataElementDataType;
    }

    ngOnInit() {
        this.syncAnswerListItems();
        this.syncDefaultAnswerListItems();
        let stewardOrgName = this.elt.stewardOrg.name;
        this.tag = this.orgHelperService.orgsDetailedInfo[stewardOrgName].nameTags;
    }

    getRepeatLabel(fe) {
        if (!fe.repeat) return '';
        if (fe.repeat[0] === 'F') return 'over First Question';
        return parseInt(fe.repeat) + ' times';
    }

    getTemplate() {
        return (this.canEdit && this.question.edit
            ? this.formDescriptionQuestionEditTmpl
            : this.formDescriptionQuestionTmpl);
    }

    isScore(formElt) {
        return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
    }

    onAnswerListAdd() {
        this.syncDefaultAnswerListItems();
        this.onEltChange.emit();
    }

    onAnswerListRemove(removedAnswer) {
        if (removedAnswer && removedAnswer.value.valueMeaningName === this.question.question.defaultAnswer) {
            this.question.question.defaultAnswer = '';
        }
        this.syncDefaultAnswerListItems();
        this.onEltChange.emit();
    }

    openEditAnswerModal(q) {
        if (q.question.answers.length > 0) {
            const modalRef = this.modalService.open(QuestionAnswerEditContentComponent, {size: 'lg'});
            modalRef.componentInstance.answers = q.question.answers;
            modalRef.componentInstance.onCleared.subscribe(() => {
                this.onAnswerListRemove(this.question.question.defaultAnswer || undefined);
            });
            modalRef.componentInstance.onSaved.subscribe((answers) => {
                q.question.answers = _clone(answers);
                this.onEltChange.emit();
                modalRef.close();
            });
        }
    }

    openNameSelect(question, parent) {
        let dialogRef = this.dialog.open(SelectQuestionLabelComponent, {
            width: '800px',
            data: {
                question: question,
                parent: parent
            }
        });
        dialogRef.componentInstance.onSelect.subscribe(designation => {
            if (!designation || !designation.designation) {
                question.label = '';
                question.hideLabel = true;
            } else {
                SkipLogicValidateService.checkAndUpdateLabel(parent, question.label, designation.designation);
                question.label = designation.designation;
                question.hideLabel = false;
            }
            dialogRef.close();
            this.onEltChange.emit();
        });
        dialogRef.componentInstance.onClosed.subscribe(() => dialogRef.close());
        dialogRef.componentInstance.onClosed.subscribe(() => dialogRef.close());
    }

    addCdeId(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            let idArray = value.trim().split(';');
            if (idArray.length !== 2) {
                return this.alert.addAlert("danger", "Incorrect Identifier Format");
            }
            this.question.question.cde.ids.push(<any>{
                source: idArray[0].trim(),
                id: idArray[1].trim()
            });
        }

        // Reset the input value
        if (input) input.value = '';
        this.onEltChange.emit();
    }

    removeCdeId(i) {
        this.question.question.cde.ids.splice(i, 1);
        this.onEltChange.emit();
    }

    addCdeDesignation(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.question.question.cde.designations.push(<any>{
                designation: value.trim()
            });
        }

        // Reset the input value
        if (input) input.value = '';
        this.onEltChange.emit();
    }

    removeCdeDesignation(i) {
        this.question.question.cde.designations.splice(i, 1);
        this.onEltChange.emit();
    }

    addCdePv(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.question.question.cde.permissibleValues.push(<any>{
                permissibleValue: value.trim(),
                valueMeaningName: value.trim()
            });
        }

        // Reset the input value
        if (input) input.value = '';
        this.syncDefaultAnswerListItems();
        this.question.question.answers = <any>this.question.question.cde.permissibleValues.concat([]);
        this.onEltChange.emit();
    }

    removeCdePv(i) {
        this.question.question.cde.permissibleValues.splice(i, 1);
        this.question.question.answers = <any>this.question.question.cde.permissibleValues.concat([]);
        this.syncDefaultAnswerListItems();
        this.onEltChange.emit();
    }

    removeUomByIndex(i) {
        this.question.question.unitsOfMeasure.splice(i, 1);
        this.ucumService.validateUoms(this.question.question);
        this.onEltChange.emit();
    }

    slOptionsRetrigger() {
        if (this.slInput) {
            setTimeout(() => {
                this.slInput.nativeElement.dispatchEvent(FormDescriptionQuestionDetailComponent.inputEvent);
            }, 0);
        }
    }

    private syncAnswerListItems() {
        this.answerListItems = this.question.question.cde.permissibleValues.concat([]);
        this.syncDefaultAnswerListItems();
    }

    private syncDefaultAnswerListItems() {
        this.defaultAnswerListItems = this.question.question.answers.concat([]);
    }

    typeaheadSkipLogic(parent, fe, event) {
        if (fe.skipLogic && fe.skipLogic.condition !== event) {
            this.skipLogicValidateService.typeaheadSkipLogic(parent, fe, event);
            this.onEltChange.emit();
        }
    }

    onSelectItem(parent, question, $event, slInput) {
        this.typeaheadSkipLogic(parent, question, $event);
        $event.preventDefault();
        slInput.focus();
        this.slOptionsRetrigger();
    }

    uomAddNew() {
        if (!this.question.question.unitsOfMeasure.filter(u => u.code === this.newUom
            && u.system === this.newUomSystem).length) {
            this.question.question.unitsOfMeasure.push(new CodeAndSystem(this.newUomSystem, this.newUom));
            this.onEltChange.emit();
        }
        this.newUom = '';
    }

    uomAddSelected(event) {
        if (event && event.item && event.item.code && event.item.code !== '') {
            this.newUom = event.item.code;
            this.uomAddNew();
            setTimeout(() => this.newUom = '', 0); // the type-ahead seems to fill in the value asynchronously
            this.ucumService.validateUoms(this.question.question);
        }
    }
}
