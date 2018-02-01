import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'angular-tree-component';
import _isEqual from 'lodash/isEqual';
import _isEmpty from 'lodash/isEmpty';
import _union from 'lodash/union';
import { debounceTime, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { AlertService } from '_app/alert/alert.service';
import { FormElement, FormQuestion, PermissibleFormValue, SkipLogic } from 'shared/form/form.model';
import { FormattedValue } from 'shared/models.model';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { OrgHelperService } from 'core/orgHelper.service';

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
        if (!this.question.instructions) this.question.instructions = new FormattedValue;
        if (!this.question.skipLogic) this.question.skipLogic = new SkipLogic;
        if (!this.question.question.uoms) this.question.question.uoms = [];
        if (this.question.question.uoms) this.ucumService.validateUoms(this.question.question);
    }
    @Output() onEltChange: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('formDescriptionNameSelectTmpl') formDescriptionNameSelectTmpl: NgbModalModule;
    @ViewChild('formDescriptionQuestionTmpl') formDescriptionQuestionTmpl: TemplateRef<any>;
    @ViewChild('formDescriptionQuestionEditTmpl') formDescriptionQuestionEditTmpl: TemplateRef<any>;
    @ViewChild('slInput') slInput: ElementRef;
    answersOptions: any = {
        allowClear: true,
        multiple: true,
        closeOnSelect: true,
        placeholder: {
            id: '',
            placeholder: 'Leave blank to ...'
        },
        tags: true,
        language: {
            noResults: () => {
                return 'No Answer List entries are listed on the CDE.';
            }
        }
    };
    namingTags = [];
    answersSelected: Array<string>;
    nameSelectModal: any = {};
    nameSelectModalRef: NgbModalRef;
    question: FormQuestion;
    parent: FormElement;
    uomOptions: any = {
        multiple: true,
        tags: true,
        language: {
            noResults: () => {
                return 'No Units of Measure are listed on the CDE. Type in more followed by ENTER.';
            }
        }
    };
    uomVersion = 0;
    static inputEvent = new Event('input');
    public namingSelet2Options: Select2Options = {
        multiple: true,
        tags: true
    };
    public dataTypeOptions = ['Value List', 'Text', 'Date', 'Number'];
    datatypeSelect2Options = {
        multiple: false,
        tags: true
    };
    newCdePv = {};
    newCdeId = {};
    newCdeNaming = {};
    newUom = '';

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public modalService: NgbModal,
        private orgHelperService: OrgHelperService,
        public skipLogicValidateService: SkipLogicValidateService,
        private ucumService: UcumService,
    ) {
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
        this.namingTags = this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name].nameTags;
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

    checkUom(uoms) {
        let newUoms = (Array.isArray(uoms.value) ? uoms.value.filter(uom => uom !== '') : []);
        if (!_isEqual(this.question.question.uoms, newUoms)) {
            this.question.question.uoms = newUoms;
            this.onEltChange.emit();
            this.ucumService.validateUoms(this.question.question);
        }
    }

    getRepeatLabel(fe) {
        if (!fe.repeat) return '';
        if (fe.repeat[0] === 'F') return 'over First Question';
        return parseInt(fe.repeat) + ' times';
    }

    getSkipLogicOptions = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            map(term => this.skipLogicValidateService.getTypeaheadOptions(term, this.parent, this.question))
        )

    getTemplate() {
        return (this.canEdit && this.question.edit
            ? this.formDescriptionQuestionEditTmpl
            : this.formDescriptionQuestionTmpl);
    }

    getAnswersData() {
        return this.question.question.cde.permissibleValues.map(answer => {
            return {id: answer.permissibleValue, text: answer.valueMeaningName};
        });
    }

    getAnswersValue() {
        if (!this.answersSelected && this.question.question.answers) {
            this.answersSelected = this.question.question.answers.map(a => a.permissibleValue);
        }
        return this.answersSelected;
    }

    getUoms() {
        return this.question.question.uoms.map(uom => {
            return {id: uom, text: uom};
        });
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

    // TODO : remove me
    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
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

    changedTags(name, data: { value: string[] }) {
        name.tags = data.value;
        this.onEltChange.emit();
    }

    changedDatatype(data: { value: string }) {
        this.question.question.cde.datatype = data.value;
        this.question.question.datatype = data.value;
        this.question.question.answers = [];
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

    removeCdeId(i) {
        this.question.question.cde.ids.splice(i, 1);
        this.onEltChange.emit();
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

    addNewCdeId(newCdeId) {
        if (!_isEmpty(newCdeId)) {
            if (!this.question.question.cde.ids) {
                this.question.question.cde.ids = [];
            }
            this.question.question.cde.ids.push(newCdeId);
            this.newCdeId = {};
            this.onEltChange.emit();
        } else this.alert.addAlert('danger', 'Empty identifier.');
    }

    selectedUom(event) {
        if (event && event.item && event.item.code && event.item.code !== '') {
            this.question.question.uoms = _union(this.question.question.uoms, [event.item.code]);
        }
        this.onEltChange.emit();
        this.newUom = '';
        this.ucumService.validateUoms(this.question.question);
    }

    removeUomByIndex(i) {
        this.question.question.uoms.splice(i, 1);
        this.ucumService.validateUoms(this.question.question);
        this.onEltChange.emit();
    }
}
