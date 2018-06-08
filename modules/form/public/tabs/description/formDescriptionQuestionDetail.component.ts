import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'angular-tree-component';
import _clone from 'lodash/clone';
import _isEqual from 'lodash/isEqual';
import _isEmpty from 'lodash/isEmpty';
import { debounceTime, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

import { AlertService } from '_app/alert/alert.service';
import { DataTypeService } from 'core/dataType.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { QuestionAnswerEditContentComponent } from 'form/public/tabs/description/questionAnswerEditContent.component';
import { CodeAndSystem, FormattedValue } from 'shared/models.model';
import { FormElement, FormQuestion, PermissibleFormValue, SkipLogic } from 'shared/form/form.model';
import { SelectQuestionLabelComponent } from 'form/public/tabs/description/selectQuestionLabel.component';

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
    }

    @Output() onEltChange: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('formDescriptionQuestionTmpl') formDescriptionQuestionTmpl: TemplateRef<any>;
    @ViewChild('formDescriptionQuestionEditTmpl') formDescriptionQuestionEditTmpl: TemplateRef<any>;
    @ViewChild('editAnswerModal') editAnswerModal: NgbModalModule;
    @ViewChild('slInput') slInput: ElementRef;
    answersSelected: Array<string>;
    answerList = [];
    dataTypeList = [];
    defaultAnswerList = [];
    getSkipLogicOptions = ((text$: Observable<string>) => text$.pipe(
        debounceTime(300),
        map(term => this.skipLogicValidateService.getTypeaheadOptions(term, this.parent, this.question))
    ));
    static inputEvent = new Event('input');
    newCdePv = {};
    newCdeId = {};
    newCdeDesignation = {};
    newUom = '';
    newUomSystem = 'UCUM';
    question: FormQuestion;
    parent: FormElement;
    tag = [];

    ngOnInit() {
        this.answerList = this.question.question.cde.permissibleValues.map(answer => {
            answer['id'] = answer.permissibleValue;
            return answer;
        });
        this.syncAnswerList();
        let stewardOrgName = this.elt.stewardOrg.name;
        this.tag = this.orgHelperService.orgsDetailedInfo[stewardOrgName].nameTags;
    }

    constructor(private alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal,
                public dialog: MatDialog,
                private orgHelperService: OrgHelperService,
                public skipLogicValidateService: SkipLogicValidateService,
                private ucumService: UcumService) {
        this.dataTypeList = DataTypeService.getDataTypeItemList();
    }

    addNewCdeId(newCdeId) {
        if (!_isEmpty(newCdeId)) {
            if (!this.question.question.cde.ids) {
                this.question.question.cde.ids = [];
            }
            this.question.question.cde.ids.push(newCdeId);
            this.newCdeId = {};
            this.onEltChange.emit();
        } else {
            this.alert.addAlert('danger', 'Empty identifier.');
        }
    }

    addNewCdeDesignation(newCdeDesignation) {
        if (!_isEmpty(newCdeDesignation)) {
            this.question.question.cde.designations.push(newCdeDesignation);
            this.newCdeDesignation = {};
            this.onEltChange.emit();
        } else this.alert.addAlert('danger', 'Empty designation.');
    }

    addNewCdePv(newCdePv) {
        if (!_isEmpty(newCdePv)) {
            this.question.question.cde.permissibleValues.push(newCdePv);
            this.question.question.answers.push(newCdePv);
            this.newCdePv = {};
            this.onEltChange.emit();
        } else this.alert.addAlert('danger', 'Empty PV.');
    }

    checkAnswers(answers) {
        let newAnswers = (Array.isArray(answers.value) ? answers.value.filter(answer => answer !== '') : []);
        if (!_isEqual(this.answersSelected, newAnswers)) {
            this.question.question.answers = this.question.question.cde.permissibleValues
                .filter(a => newAnswers.indexOf(a.permissibleValue) > -1) as PermissibleFormValue[];
            this.answersSelected = this.question.question.answers.map(a => a.permissibleValue);
            this.onEltChange.emit();
        }
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
        this.syncAnswerList();
        this.onEltChange.emit();
    }

    onAnswerListRemove(removedAnswer) {
        if (removedAnswer && removedAnswer.value.valueMeaningName === this.question.question.defaultAnswer) {
            this.question.question.defaultAnswer = '';
        }
        this.syncAnswerList();
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
            if (!designation.designation) {
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

    removeCdeId(i) {
        this.question.question.cde.ids.splice(i, 1);
        this.onEltChange.emit();
    }

    removeCdeDesignation(i) {
        if (this.question.question.cde.designations.length === 1) {
            return this.alert.addAlert('danger', 'Data element must have at least one name.');
        }
        this.question.question.cde.designations.splice(i, 1);
        this.onEltChange.emit();
    }

    removeCdePv(i) {
        this.question.question.cde.permissibleValues.splice(i, 1);
        this.onEltChange.emit();
    }

    // TODO : remove me
    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
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

    private syncAnswerList() {
        this.defaultAnswerList = this.question.question.answers.map(answer => {
            answer['id'] = answer.permissibleValue;
            return answer;
        });
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
