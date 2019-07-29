import { ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent, MatDialog, MatSelectChange } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { TreeNode } from 'angular-tree-component';
import { repeatFe, repeatFeLabel, repeatFeQuestion } from 'core/form/fe';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { QuestionAnswerEditContentComponent } from 'form/public/tabs/description/questionAnswerEditContent.component';
import { SelectQuestionLabelComponent } from 'form/public/tabs/description/selectQuestionLabel.component';
import _clone from 'lodash/clone';
import _noop from 'lodash/noop';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataTypeArray, QuestionTypeDate, QuestionTypeNumber, QuestionTypeText } from 'shared/de/dataElement.model';
import { pvGetLabel } from 'core/de/deShared';
import { iterateFeSync } from 'shared/form/fe';
import { FormElement, FormQuestion, PermissibleFormValue, Question, SkipLogic } from 'shared/form/form.model';
import { CodeAndSystem, FormattedValue } from 'shared/models.model';
import { fixDatatype } from 'shared/de/deValidator';

const ignoreDatatypeArray = ['Dynamic Code List', 'Externally Defined'];
const dataTypeArray = DataTypeArray.filter(d => ignoreDatatypeArray.indexOf(d) === -1);

@Component({
    selector: 'cde-form-description-question-detail',
    templateUrl: 'formDescriptionQuestionDetail.component.html'
})
export class FormDescriptionQuestionDetailComponent implements OnInit {

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
        this.questionAnswers = (this.question.question.answers || []).map(pvGetLabel);
    }

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog,
                private orgHelperService: OrgHelperService,
                public ucumService: UcumService) {
    }
    @Input() canEdit = false;
    @Input() elt;

    @Output() onEltChange: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('formDescriptionQuestionTmpl') formDescriptionQuestionTmpl!: TemplateRef<any>;
    @ViewChild('formDescriptionQuestionEditTmpl') formDescriptionQuestionEditTmpl!: TemplateRef<any>;
    readonly DataTypeArray = dataTypeArray;
    answerListItems: string[] = [];
    defaultAnswerListItems: string[] = [];
    newUom = '';
    newUomSystem = 'UCUM';
    parent!: FormElement;
    question!: FormQuestion;
    questionAnswers: string[] = [];
    repeatFeLabel = repeatFeLabel;
    readonly separatorKeysCodes: number[] = [ENTER];
    tag = [];

    uomControl = new FormControl();
    filteredUoms = [];

    static updateRepeatQuestions(elt, oldLabel: string, newLabel: string) {
        const modifyRepeat = fe => {
            if (repeatFe(fe) === '=' && repeatFeQuestion(fe) === oldLabel) {
                fe.repeat = '="' + newLabel + '"';
            }
        };
        iterateFeSync(elt, modifyRepeat, modifyRepeat, modifyRepeat);
    }

    ngOnInit() {
        this.syncAnswerListItems();
        this.syncDefaultAnswerListItems();
        const stewardOrgName = this.elt.stewardOrg.name;
        this.orgHelperService.then(orgsDetailedInfo => {
            this.tag = orgsDetailedInfo[stewardOrgName].nameTags;
        }, _noop);
        this.uomControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(value => value.length < 3 ? [] : this.ucumService.searchUcum(value)
                )
            ).subscribe(uoms => this.filteredUoms = uoms);
    }

    datatypeChange(q) {
        q.question.answers = undefined;
        q.question.cde.permissibleValues = undefined;
        q.question.datatypeDate = undefined;
        q.question.datatypeNumber = undefined;
        q.question.datatypeText = undefined;
        switch (q.question.datatype) {
            case 'Value List':
                q.question.answers = [];
                q.question.cde.permissibleValues = [];
                break;
            case 'Date':
                q.question.datatypeDate = new QuestionTypeDate();
                break;
            case 'Geo Location':
            case 'Time':
            case 'Externally Defined':
            case 'File':
                break;
            case 'Number':
                q.question.datatypeNumber = new QuestionTypeNumber();
                break;
            case 'Text':
            default:
                q.question.datatypeText = new QuestionTypeText();
                break;
        }
    }

    getTemplate() {
        return (this.canEdit && this.question.edit
            ? this.formDescriptionQuestionEditTmpl
            : this.formDescriptionQuestionTmpl);
    }

    isScore(formElt) {
        return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
    }

    onAnswerListChanged() {
        this.question.question.answers = (this.question.question.cde.permissibleValues as PermissibleFormValue[]).filter(ans =>
            this.questionAnswers.indexOf(ans.valueMeaningName || ans.permissibleValue) >= 0);
        this.syncDefaultAnswerListItems();
        this.onEltChange.emit();
    }

    openEditAnswerModal(q) {
        this.dialog.open(QuestionAnswerEditContentComponent, {data: {answers: q.question.answers}})
            .afterClosed().subscribe(response => {
            if (response === 'clear') {
                q.question.answers = [];
                this.questionAnswers = [];
                this.onAnswerListChanged();
            } else if (response) {
                q.question.answers = _clone(response);
                this.questionAnswers = this.question.question.answers.map(pvGetLabel);
                this.onEltChange.emit();
            }
        });
    }

    openNameSelect(question: FormQuestion, parent: FormElement) {
        const dialogRef = this.dialog.open(SelectQuestionLabelComponent, {
            width: '800px',
            data: {
                question,
                parent
            }
        });
        dialogRef.componentInstance.onSelect.subscribe(designation => {
            if (designation && designation.designation) {
                SkipLogicValidateService.checkAndUpdateLabel(parent, question.label, designation.designation);
                FormDescriptionQuestionDetailComponent.updateRepeatQuestions(this.elt, question.label, designation.designation);
                question.label = designation.designation;
            } else {
                question.label = '';
            }
            dialogRef.close();
            this.onEltChange.emit();
        });
        dialogRef.componentInstance.onClosed.subscribe(() => dialogRef.close());
    }

    addCdeId(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            const idArray = value.trim().split(';');
            if (idArray.length !== 2) {
                return this.alert.addAlert('danger', 'Incorrect Identifier Format');
            }
            this.question.question.cde.ids.push({
                source: idArray[0].trim(),
                id: idArray[1].trim()
            });
        }

        // Reset the input value
        if (input) { input.value = ''; }
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
            this.question.question.cde.designations.push({
                designation: value.trim()
            });
        }

        // Reset the input value
        if (input) { input.value = ''; }
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
            this.question.question.cde.permissibleValues.push({
                permissibleValue: value.trim(),
                valueMeaningName: value.trim()
            });
        }

        // Reset the input value
        if (input) { input.value = ''; }
        this.syncDefaultAnswerListItems();
        this.question.question.answers = this.question.question.cde.permissibleValues.concat([]) as any;
        this.onEltChange.emit();
    }

    removeCdePv(i) {
        this.question.question.cde.permissibleValues.splice(i, 1);
        this.question.question.answers = this.question.question.cde.permissibleValues.concat([]) as any;
        this.syncDefaultAnswerListItems();
        this.onEltChange.emit();
    }

    removeUomByIndex(i) {
        this.question.question.unitsOfMeasure.splice(i, 1);
        this.ucumService.validateUoms(this.question.question);
        this.onEltChange.emit();
    }

    private syncAnswerListItems() {
        this.answerListItems = (this.question.question.cde.permissibleValues || []).map(p => {
            let value = p.valueMeaningName;
            if (!value) { value = p.permissibleValue; }
            return value;
        });
        this.syncDefaultAnswerListItems();
    }

    private syncDefaultAnswerListItems() {
        this.defaultAnswerListItems = (this.question.question.answers || []).map(p => {
            let value = p.valueMeaningName;
            if (!value) { value = p.permissibleValue; }
            return value;
        });
    }

    onDatatypeChange(question: Question, event: MatSelectChange) {
        question.datatype = event.value;
        fixDatatype(question);
        if (question.datatype === 'Value List') {
            question.answers = [];
            question.cde.permissibleValues = [];
        }
        this.onEltChange.emit();
    }

    uomAddNew() {
        if (!this.question.question.unitsOfMeasure.filter(u => u.code === this.newUom
            && u.system === this.newUomSystem).length) {
            this.question.question.unitsOfMeasure.push(new CodeAndSystem(this.newUomSystem, this.newUom));
            this.onEltChange.emit();
        }
        this.newUom = '';
    }

    uomAddSelected(uom) {
        if (uom && uom.code) {
            this.newUom = uom.code;
            this.uomAddNew();
            this.newUom = '';
            this.ucumService.validateUoms(this.question.question);
        }
    }

    displayFn(uom) {
        return uom ? uom.name : '';
    }
}
