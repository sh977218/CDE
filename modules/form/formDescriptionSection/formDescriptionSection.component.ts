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
import { FormDescriptionComponent } from 'form/formDescription/formDescription.component';
import { isEqual } from 'lodash';
import { fetchForm } from 'nativeRender/form.service';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { LocalStorageService } from 'non-core/localStorage.service';
import { FormattedValue } from 'shared/models.model';
import { getLabel } from 'shared/form/fe';
import { CdeForm, FormElement, FormInForm, FormSectionOrForm, SkipLogic } from 'shared/form/form.model';
import { getQuestionsPrior } from 'shared/form/skipLogic';
import { noop } from 'shared/util';
import {
    FormUpdateFormVersionModalComponent
} from 'form/form-update-form-version-modal/form-update-form-version-modal.component';

@Component({
    selector: 'cde-form-description-section',
    templateUrl: 'formDescriptionSection.component.html'
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


    openUpdateFormVersionModal(formSection: FormInForm) {
        const data = formSection;
        this.dialog.open(FormUpdateFormVersionModalComponent, {width: '1000px', data})
            .afterClosed()
            .subscribe(newSection => {
                if (newSection) {
                    formSection.inForm = newSection.inForm;
                    formSection.formElements = newSection.formElements;
                    formSection.label = newSection.label;
                    this.formDescriptionComponent.updateTree();
                    this.eltChange.emit();
                }
            });
    }
}
