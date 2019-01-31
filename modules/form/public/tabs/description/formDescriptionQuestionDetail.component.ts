import { ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent, MatDialog } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { TreeNode } from 'angular-tree-component';
import { DataTypeService } from 'core/dataType.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { QuestionAnswerEditContentComponent } from 'form/public/tabs/description/questionAnswerEditContent.component';
import { SelectQuestionLabelComponent } from 'form/public/tabs/description/selectQuestionLabel.component';
import _clone from 'lodash/clone';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';


import { CodeAndSystem, FormattedValue } from 'shared/models.model';
import { FormElement, FormQuestion, SkipLogic } from 'shared/form/form.model';

@Component({
    selector: 'cde-form-description-question-detail',
    templateUrl: 'formDescriptionQuestionDetail.component.html'
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
        this.questionAnswers = this.question.question.answers.map(p => p.valueMeaningName);
    }

    @Output() onEltChange: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('formDescriptionQuestionTmpl') formDescriptionQuestionTmpl!: TemplateRef<any>;
    @ViewChild('formDescriptionQuestionEditTmpl') formDescriptionQuestionEditTmpl!: TemplateRef<any>;
    @ViewChild('slInput') slInput: ElementRef;

    questionAnswers = [];

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


    uomControl = new FormControl();
    filteredUoms = [];

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog,
                private orgHelperService: OrgHelperService,
                public skipLogicValidateService: SkipLogicValidateService,
                public ucumService: UcumService) {
        this.dataTypeList = DataTypeService.dataElementDataType;
    }

    ngOnInit() {
        this.syncAnswerListItems();
        this.syncDefaultAnswerListItems();
        let stewardOrgName = this.elt.stewardOrg.name;
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

    onAnswerListChanged() {
        let answers = this.question.question.answers.filter(ans => this.questionAnswers.indexOf(ans.valueMeaningName) >= 0);
        this.question.question.answers = answers;
        this.syncDefaultAnswerListItems();
        this.onEltChange.emit();
    }

    openEditAnswerModal(q) {
        this.dialog.open(QuestionAnswerEditContentComponent, {data: {answers: q.question.answers}})
            .afterClosed().subscribe(response => {
            if (response === "clear") {
                q.question.answers = [];
                this.onAnswerListChanged();
            } else if (response) {
                q.question.answers = _clone(response);
                this.questionAnswers = this.question.question.answers.map(p => p.valueMeaningName);
                this.onEltChange.emit();
            }
        });
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
        this.answerListItems = this.question.question.cde.permissibleValues.map(p => p.valueMeaningName);
        this.syncDefaultAnswerListItems();
    }

    private syncDefaultAnswerListItems() {
        this.defaultAnswerListItems = this.question.question.answers.map(p => p.valueMeaningName);
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
