import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'angular-tree-component';
import _isEqual from 'lodash/isEqual';
import _isEmpty from 'lodash/isEmpty';
import _clone from 'lodash/clone';
import { debounceTime, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

import { AlertService } from '_app/alert/alert.service';
import { DataTypeService } from 'core/dataType.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { CodeAndSystem, FormattedValue } from 'shared/models.model';
import { FormElement, FormQuestion, PermissibleFormValue, SkipLogic } from 'shared/form/form.model';
import { QuestionAnswerEditContentComponent } from 'form/public/tabs/description/questionAnswerEditContent.component';

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
    @ViewChild('formDescriptionNameSelectTmpl') formDescriptionNameSelectTmpl: NgbModalModule;
    @ViewChild('formDescriptionQuestionTmpl') formDescriptionQuestionTmpl: TemplateRef<any>;
    @ViewChild('formDescriptionQuestionEditTmpl') formDescriptionQuestionEditTmpl: TemplateRef<any>;
    @ViewChild('editAnswerModal') editAnswerModal: NgbModalModule;
    @ViewChild('slInput') slInput: ElementRef;
    answersSelected: Array<string>;
    getSkipLogicOptions = ((text$: Observable<string>) => text$.pipe(
        debounceTime(300),
        map(term => this.skipLogicValidateService.getTypeaheadOptions(term, this.parent, this.question))
    ));
    static inputEvent = new Event('input');
    nameSelectModal: any = {};
    nameSelectModalRef: NgbModalRef;
    newCdePv = {};
    newCdeId = {};
    newCdeNaming = {};
    newUom = '';
    newUomSystem = 'UCUM';
    question: FormQuestion;
    parent: FormElement;

    dataTypeList = [];
    answerList$ = [];
    defaultAnswerList$ = [];
    tag$ = [];

    constructor(private alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal,
                private orgHelperService: OrgHelperService,
                public skipLogicValidateService: SkipLogicValidateService,
                private ucumService: UcumService) {
        this.dataTypeList = DataTypeService.getDataTypeItemList();
        this.nameSelectModal.okSelect = (naming = null) => {
            if (!naming) {
                this.nameSelectModal.question.label = '';
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

    ngOnInit() {
        this.answerList$ = this.question.question.cde.permissibleValues.map(answer => {
            answer['id'] = answer.permissibleValue;
            return answer;
        });
        this.syncAnswerList();
        let stewardOrgName = this.elt.stewardOrg.name;
        this.tag$ = this.orgHelperService.orgsDetailedInfo[stewardOrgName].nameTags;
    }

    private syncAnswerList() {
        this.defaultAnswerList$ = this.question.question.answers.map(answer => {
            answer['id'] = answer.permissibleValue;
            return answer;
        });
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

    addNewCdeNaming(newCdeNaming) {
        if (!_isEmpty(newCdeNaming)) {
            this.question.question.cde.naming.push(newCdeNaming);
            this.newCdeNaming = {};
            this.onEltChange.emit();
        } else this.alert.addAlert('danger', 'Empty name.');
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

    openNameSelect(question, section) {
        this.nameSelectModal.section = section;
        this.nameSelectModal.question = question;
        this.nameSelectModal.cde = question.question.cde;
        if (this.nameSelectModal.cde.tinyId) {
            let url = '/de/' + this.nameSelectModal.cde.tinyId;
            if (this.nameSelectModal.cde.version) url += '/version/' + this.nameSelectModal.cde.version;
            this.http.get(url).subscribe((response) => {
                this.nameSelectModal.cde = response;
            }, () => {
                this.nameSelectModal.cde = 'error';
            });
        }
        this.nameSelectModal.updateSkipLogic = SkipLogicValidateService.checkAndUpdateLabel(section, this.nameSelectModal.question.label);
        this.nameSelectModalRef = this.modalService.open(this.formDescriptionNameSelectTmpl, {size: 'lg'});
        this.nameSelectModalRef.result.then(() => this.onEltChange.emit(), () => {
        });
    }

    removeCdeId(i) {
        this.question.question.cde.ids.splice(i, 1);
        this.onEltChange.emit();
    }

    removeCdeNaming(i) {
        if (this.question.question.cde.naming.length === 1) {
            return this.alert.addAlert('danger', 'Data element must have at least one name.');
        }
        this.question.question.cde.naming.splice(i, 1);
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

    typeaheadSkipLogic(parent, fe, event) {
        if (fe.skipLogic && fe.skipLogic.condition !== event) {
            this.skipLogicValidateService.typeaheadSkipLogic(parent, fe, event);
            this.onEltChange.emit();
        }
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

    openEditAnswerModal(q) {
        if (q.question.answers.length > 0) {
            const modalRef = this.modalService.open(QuestionAnswerEditContentComponent, {size: 'lg'});
            modalRef.componentInstance.answers = q.question.answers;
            modalRef.componentInstance.onSaved.subscribe((answers) => {
                q.question.answers = _clone(answers);
                this.onEltChange.emit();
                modalRef.close();
            });
        }
    }
}
