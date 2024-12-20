import { ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { AlertService } from 'alert/alert.service';
import { TreeNode } from '@ali-hm/angular-tree-component';
import { pvGetLabel } from 'core/de/deShared';
import { repeatFe, repeatFeLabel, repeatFeQuestion } from 'core/form/fe';
import { SkipLogicValidateService } from 'form/skipLogicValidate.service';
import { UcumService, UcumSynonyms } from 'form/ucum.service';
import {
    QuestionAnswerEditContentComponent,
    QuestionAnswerEditContentData,
    QuestionAnswerEditContentOutput,
} from 'form/questionAnswerEditContent/questionAnswerEditContent.component';
import {
    SelectQuestionLabelComponent,
    SelectQuestionLabelData,
    SelectQuestionLabelOutput,
} from 'form/selectQuestionLabel/selectQuestionLabel.component';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DATA_TYPE_ARRAY } from 'shared/de/dataElement.model';
import { isScore, iterateFeSync } from 'shared/form/fe';
import {
    CdeForm,
    FormElement,
    FormQuestion,
    FormQuestionDraft,
    FormSection,
    Question,
    QuestionValueList,
    SkipLogic,
} from 'shared/form/form.model';
import { CodeAndSystem, Designation, FormattedValue } from 'shared/models.model';
import { fixDatatype } from 'shared/de/dataElement.model';
import { noop } from 'shared/util';

const ignoreDatatypeArray = ['Dynamic Code List', 'Externally Defined'];
const dataTypeArray = DATA_TYPE_ARRAY.filter(d => ignoreDatatypeArray.indexOf(d) === -1);

@Component({
    selector: 'cde-form-description-question-detail',
    templateUrl: 'formDescriptionQuestionDetail.component.html',
    styleUrls: ['./formDescriptionQuestionDetail.component.scss'],
})
export class FormDescriptionQuestionDetailComponent implements OnInit {
    @Input() set node(node: TreeNode) {
        this.question = node.data;
        this.parent = node.parent.data;
        if (!this.question.instructions) {
            this.question.instructions = new FormattedValue();
        }
        if (!this.question.skipLogic) {
            this.question.skipLogic = new SkipLogic();
        }
        if (!this.question.question.unitsOfMeasure) {
            this.question.question.unitsOfMeasure = [];
        }
        if (this.question.question.unitsOfMeasure) {
            this.ucumService.validateUoms(this.question.question);
        }
        this.questionAnswers = (
            (this.question.question.datatype === 'Value List' && this.question.question.answers) ||
            []
        ).map(pvGetLabel);
    }

    @Input() canEdit = false;
    @Input() elt!: CdeForm;
    @Output() eltChange: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('formDescriptionQuestionTmpl', { static: true })
    formDescriptionQuestionTmpl!: TemplateRef<any>;
    @ViewChild('formDescriptionQuestionEditTmpl', { static: true })
    formDescriptionQuestionEditTmpl!: TemplateRef<any>;
    readonly dataTypeArray = dataTypeArray;
    answerListItems: string[] = [];
    filteredUoms: UcumSynonyms[] = [];
    isScore = isScore;
    newUom = '';
    newUomSystem = 'UCUM';
    parent!: FormElement;
    question!: FormQuestionDraft;
    questionAnswers: string[] = [];
    pvGetLabel = pvGetLabel;
    repeatFeLabel = repeatFeLabel;
    readonly separatorKeysCodes: number[] = [ENTER];
    tag: string[] = [];
    uomControl = new UntypedFormControl();

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public dialog: MatDialog,
        private orgHelperService: OrgHelperService,
        public ucumService: UcumService
    ) {}

    ngOnInit() {
        this.syncAnswerListItems();
        const stewardOrgName: string = this.elt.stewardOrg.name || '';
        this.orgHelperService.then(orgsDetailedInfo => {
            this.tag = orgsDetailedInfo[stewardOrgName].nameTags || [];
        }, noop);
        this.uomControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(value =>
                    typeof value !== 'string' || value.length < 3 ? [] : this.ucumService.searchUcum(value)
                )
            )
            .subscribe(uoms => (this.filteredUoms = uoms));
    }

    defaultToLabel(question: Question) {
        return question.datatype === 'Value List'
            ? pvGetLabel(question.answers.filter(pv => pv.permissibleValue === question.defaultAnswer)[0])
            : question.defaultAnswer;
    }

    displayUom(uom: UcumSynonyms) {
        return uom ? uom.name : '';
    }

    getTemplate() {
        return this.canEdit && this.question.edit
            ? this.formDescriptionQuestionEditTmpl
            : this.formDescriptionQuestionTmpl;
    }

    onAnswerListChanged() {
        const question = this.question.question as QuestionValueList;
        question.answers = question.cde.permissibleValues.filter(
            ans => this.questionAnswers.indexOf(ans.valueMeaningName || ans.permissibleValue) >= 0
        );
        this.eltChange.emit();
    }

    openEditAnswerModal() {
        const question: QuestionValueList = this.question.question as QuestionValueList;
        this.dialog
            .open<QuestionAnswerEditContentComponent, QuestionAnswerEditContentData, QuestionAnswerEditContentOutput>(
                QuestionAnswerEditContentComponent,
                {
                    data: {
                        answers: question.answers,
                    },
                }
            )
            .afterClosed()
            .subscribe(response => {
                if (response === 'clear') {
                    question.answers = [];
                    this.questionAnswers = [];
                    this.onAnswerListChanged();
                } else if (response) {
                    question.answers = response.concat();
                    this.questionAnswers = question.answers.map(pvGetLabel);
                    this.eltChange.emit();
                }
            });
    }

    openNameSelect(question: FormQuestion, parent: FormSection) {
        this.dialog
            .open<SelectQuestionLabelComponent, SelectQuestionLabelData, SelectQuestionLabelOutput>(
                SelectQuestionLabelComponent,
                {
                    width: '800px',
                    data: {
                        question,
                        parent,
                    },
                }
            )
            .afterClosed()
            .subscribe(designation => {
                if (designation && designation.designation) {
                    SkipLogicValidateService.checkAndUpdateLabel(parent, question.label || '', designation.designation);
                    FormDescriptionQuestionDetailComponent.updateRepeatQuestions(
                        this.elt,
                        question.label || '',
                        designation.designation
                    );
                    question.label = designation.designation;
                } else {
                    question.label = '';
                }
                this.eltChange.emit();
            });
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
                id: idArray[1].trim(),
            });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        if (value) {
            this.eltChange.emit();
        }
    }

    removeCdeId(i: number) {
        this.question.question.cde.ids.splice(i, 1);
        this.eltChange.emit();
    }

    addCdeDesignation(designations: Designation[], event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            designations.push({
                designation: value.trim(),
                tags: [],
                sources: [],
            });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        if (value) {
            this.eltChange.emit();
        }
    }

    removeCdeDesignation(designations: Designation[], i: number) {
        designations.splice(i, 1);
        this.eltChange.emit();
    }

    addCdePv(event: MatChipInputEvent): void {
        const question = this.question.question as QuestionValueList;
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            question.cde.permissibleValues.push({
                permissibleValue: value.trim(),
                valueMeaningName: value.trim(),
            });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        question.answers = question.cde.permissibleValues.concat([]) as any;
        if (value) {
            this.eltChange.emit();
        }
    }

    removeCdePv(i: number) {
        const question = this.question.question as QuestionValueList;
        question.cde.permissibleValues.splice(i, 1);
        question.answers = question.cde.permissibleValues.concat([]) as any;
        this.eltChange.emit();
    }

    removeUomByIndex(i: number) {
        this.question.question.unitsOfMeasure.splice(i, 1);
        this.ucumService.validateUoms(this.question.question);
        this.eltChange.emit();
    }

    private syncAnswerListItems() {
        if (this.question.question.datatype === 'Value List') {
            this.answerListItems = this.question.question.cde.permissibleValues.map(pvGetLabel);
        }
    }

    onDatatypeChange(question: Question, event: MatSelectChange) {
        question.datatype = event.value;
        fixDatatype(question);
        if (question.datatype === 'Value List') {
            question.answers = [];
            question.cde.permissibleValues = [];
        }
        this.eltChange.emit();
    }

    uomAddNew() {
        if (
            !this.question.question.unitsOfMeasure.filter(u => u.code === this.newUom && u.system === this.newUomSystem)
                .length
        ) {
            this.question.question.unitsOfMeasure.push(new CodeAndSystem(this.newUomSystem, this.newUom));
            this.eltChange.emit();
        }
        this.newUom = '';
    }

    uomAddSelected(uom: CodeAndSystem) {
        if (uom && uom.code) {
            this.newUom = uom.code;
            this.uomAddNew();
            this.newUom = '';
            this.ucumService.validateUoms(this.question.question);
        }
    }

    static updateRepeatQuestions(elt: CdeForm, oldLabel: string, newLabel: string) {
        const modifyRepeat = (fe: FormElement) => {
            if (repeatFe(fe) === '=' && repeatFeQuestion(fe) === oldLabel) {
                fe.repeat = '="' + newLabel + '"';
            }
        };
        iterateFeSync(elt, modifyRepeat, modifyRepeat, modifyRepeat);
    }
}
