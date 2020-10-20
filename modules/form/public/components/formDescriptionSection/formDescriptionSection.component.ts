import { HttpClient } from '@angular/common/http';
import {
    Component, ElementRef, EventEmitter, Host, Input, OnInit, Output, TemplateRef,
    ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TreeNode } from '@circlon/angular-tree-component';
import { AlertService } from 'alert/alert.service';
import { repeatFe, repeatFeLabel, repeatFeNumber, repeatFeQuestion } from 'core/form/fe';
import { convertFormToSection } from 'core/form/form';
import { FormDescriptionComponent } from 'form/public/components/formDescription/formDescription.component';
import * as _isEqual from 'lodash/isEqual';
import * as _noop from 'lodash/noop';
import { FormService } from 'nativeRender/form.service';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { LocalStorageService } from 'non-core/localStorage.service';
import { FormattedValue } from 'shared/models.model';
import { getLabel } from 'shared/form/fe';
import { CdeForm, FormElement, FormInForm, FormSectionOrForm, SkipLogic } from 'shared/form/form.model';
import { getQuestionsPrior } from 'shared/form/skipLogic';

@Component({
    selector: 'cde-form-description-section',
    templateUrl: 'formDescriptionSection.component.html',
    styles: [`
        .outdated-bg {
            background-color: #ffecc5;
            border: 1px;
            border-radius: 10px;
        }
    `]
})
export class FormDescriptionSectionComponent implements OnInit {
    @Input() elt!: CdeForm;
    @Input() canEdit = false;
    @Input() index!: number;
    @Input() node!: TreeNode;
    @Output() eltChange: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('formDescriptionSectionTmpl', {static: true}) formDescriptionSectionTmpl!: TemplateRef<any>;
    @ViewChild('formDescriptionFormTmpl', {static: true}) formDescriptionFormTmpl!: TemplateRef<any>;
    @ViewChild('slInput', {static: true}) slInput!: ElementRef;
    @ViewChild('updateFormVersionTmpl', {static: true}) updateFormVersionTmpl!: TemplateRef<any>;
    isSubForm = false;
    formSection?: FormInForm;
    parent!: FormElement;
    repeatFeLabel = repeatFeLabel;
    repeatOptions = [
        {label: '', value: ''},
        {label: 'Set Number of Times', value: 'N'},
        {label: 'Over answer of specified question', value: '='},
        {label: 'Over first question', value: 'F'}
    ];
    repeatQuestions?: string[];
    section!: FormSectionOrForm;
    updateFormVersion: any;

    constructor(private alert: AlertService,
                @Host() public formDescriptionComponent: FormDescriptionComponent,
                private http: HttpClient,
                private localStorageService: LocalStorageService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.section = this.node.data;
        this.formSection = this.section && this.section.elementType === 'form' ? this.section as FormInForm : undefined;
        this.parent = this.node.parent.data;
        this.repeatQuestions = getQuestionsPrior(this.parent, this.section, undefined, this.elt).map(getLabel);
        this.section.repeatOption = repeatFe(this.section);
        this.section.repeatNumber = repeatFeNumber(this.section);
        this.section.repeatQuestion = repeatFeQuestion(this.section);
        if (!this.section.instructions) {
            this.section.instructions = new FormattedValue();
        }
        if (!this.section.skipLogic) {
            this.section.skipLogic = new SkipLogic();
        }

        if (this.node.data.elementType === 'form') {
            if (FormDescriptionComponent.isSubForm(this.node.parent)) {
                this.isSubForm = FormDescriptionComponent.isSubForm(this.node);
            }
        } else {
            if (FormDescriptionComponent.isSubForm(this.node)) {
                this.isSubForm = FormDescriptionComponent.isSubForm(this.node);
            }
        }

        this.checkRepeatOptions();
    }


    canEditSection() {
        return this.section.edit && !this.isSubForm && this.canEdit;
    }

    checkRepeatOptions() {
        if (this.section.repeat && this.section.repeat[0] === 'F' && !NativeRenderService.getFirstQuestion(this.section)) {
            this.alert.addAlert('danger',
                this.section.label + ' Repeat on First Question: Value List is not available.');
        }
    }

    copySection(section: FormSectionOrForm) {
        this.localStorageService.setItem('sectionCopied', section);
        section.isCopied = 'copied';
        this.elt.isCopied = 'copied';
        setTimeout(() => {
            section.isCopied = 'clear';
            delete this.elt.isCopied;
        }, 3000);
    }

    editSection(section: FormSectionOrForm) {
        if (!this.isSubForm && this.canEdit) {
            section.edit = !section.edit;
            this.formDescriptionComponent.setCurrentEditing(this.parent.formElements, section, this.index);
        }
    }

    getTemplate() {
        return (this.section.elementType === 'section' ? this.formDescriptionSectionTmpl : this.formDescriptionFormTmpl);
    }

    hoverInSection(section: FormSectionOrForm) {
        if (!this.isSubForm && this.canEdit) {
            section.hover = true;
        }
    }

    hoverOutSection(section: FormSectionOrForm) {
        if (!this.isSubForm && this.canEdit) {
            section.hover = false;
        }
    }

    openUpdateFormVersion(formSection: FormInForm) {
        FormService.fetchForm(formSection.inForm.form.tinyId).then(newForm => {
            const oldVersion = formSection.inForm.form.version ? formSection.inForm.form.version : '';
            FormService.fetchForm(formSection.inForm.form.tinyId, oldVersion).then(oldForm => {
                this.openUpdateFormVersionMerge(convertFormToSection(newForm), formSection, newForm, oldForm);
            });
        });
    }

    openUpdateFormVersionMerge(newSection: FormInForm, currentSection: FormInForm, newForm: CdeForm, oldForm: CdeForm) {
        newSection.instructions = currentSection.instructions;
        newSection.repeat = currentSection.repeat;
        newSection.skipLogic = currentSection.skipLogic;
        if (newForm.designations.some(n => n.designation === currentSection.label)) {
            newSection.label = currentSection.label;
        }

        const modal: any = {
            currentSection,
            newSection
        };
        modal.bForm = true;
        modal.bLabel = !_isEqual(newForm.designations, oldForm.designations);

        this.updateFormVersion = modal;
        this.dialog.open<boolean>(this.updateFormVersionTmpl, {width: '1000px'}).afterClosed().subscribe(res => {
            if (res) {
                currentSection.inForm = newSection.inForm;
                currentSection.formElements = newSection.formElements;
                currentSection.label = newSection.label;
                this.formDescriptionComponent.updateTree();
                this.eltChange.emit();
            }
        }, _noop);
    }

    removeNode(node: TreeNode) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        // this.onEltChange.emit(); treeEvent will handle, this one works
    }

    repeatChange(section: FormSectionOrForm) {
        if (section.repeatOption === 'F') {
            section.repeat = 'First Question';
        } else if (section.repeatOption === '=') {
            section.repeat = '="' + section.repeatQuestion + '"';
        } else if (section.repeatOption === 'N') {
            section.repeat = (section.repeatNumber && section.repeatNumber > 1 ? section.repeatNumber.toString() : undefined);
        } else {
            section.repeat = undefined;
        }

        this.checkRepeatOptions();
        this.eltChange.emit();
    }
}
