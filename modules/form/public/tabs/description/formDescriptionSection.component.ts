import { HttpClient } from '@angular/common/http';
import {
    Component, ElementRef, EventEmitter, Host, Input, OnInit, Output, TemplateRef,
    ViewChild
} from "@angular/core";
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from "angular-tree-component";
import { LocalStorageService } from 'angular-2-local-storage';
import _isEqual from 'lodash/isEqual';
import _noop from 'lodash/noop';
import { Observable } from "rxjs/Observable";
import { debounceTime, map } from 'rxjs/operators';

import { AlertService } from '_app/alert/alert.service';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { FormDescriptionComponent } from 'form/public/tabs/description/formDescription.component';
import { FormService } from 'nativeRender/form.service';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { FormattedValue } from 'shared/models.model';
import { CdeForm, FormElement, FormInForm, FormSection, SkipLogic } from 'shared/form/form.model';
import { getTags } from 'shared/form/formAndFe';
import { convertFormToSection, isSubForm } from 'shared/form/formShared';


@Component({
    selector: "cde-form-description-section",
    templateUrl: "formDescriptionSection.component.html",
    styles: [`
        .outdated-bg {
            background-color: #ffecc5;
            border: 1px;
            border-radius: 10px;
        }
    `]
})
export class FormDescriptionSectionComponent implements OnInit {
    @Input() elt: any;
    @Input() canEdit: boolean = false;
    @Input() index;
    @Input() node: TreeNode;
    @Output() onEltChange: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild("formDescriptionSectionTmpl") formDescriptionSectionTmpl: TemplateRef<any>;
    @ViewChild("formDescriptionFormTmpl") formDescriptionFormTmpl: TemplateRef<any>;
    @ViewChild("slInput") slInput: ElementRef;
    @ViewChild('updateFormVersionTmpl') updateFormVersionTmpl: NgbModalModule;
    getSkipLogicOptions = ((text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            map(term => this.skipLogicValidateService.getTypeaheadOptions(term, this.parent, this.section)),
        ));
    getTags = getTags;
    static inputEvent = new Event('input');
    isSubForm = false;
    formSection: FormInForm;
    parent: FormElement;
    repeatOptions = [
        {label: "", value: ""},
        {label: "Set Number of Times", value: "N"},
        {label: "Over first question", value: "F"}
    ];
    section: FormSection|FormInForm;
    updateFormVersion: any;

    ngOnInit() {
        this.section = this.node.data;
        this.formSection = this.section && this.section.elementType === 'form' ? this.section as FormInForm : null;
        this.parent = this.node.parent.data;
        this.section.repeatOption = FormDescriptionSectionComponent.getRepeatOption(this.section);
        this.section.repeatNumber = FormDescriptionSectionComponent.getRepeatNumber(this.section);
        if (!this.section.instructions) this.section.instructions = new FormattedValue;
        if (!this.section.skipLogic) this.section.skipLogic = new SkipLogic;

        if (this.node.data.elementType === "form") {
            if (isSubForm(this.node.parent)) this.isSubForm = isSubForm(this.node);
        } else {
            if (isSubForm(this.node)) this.isSubForm = isSubForm(this.node);
        }

        this.checkRepeatOptions();
    }

    constructor(private alert: AlertService,
                @Host() public formDescriptionComponent: FormDescriptionComponent,
                private formService: FormService,
                private http: HttpClient,
                private localStorageService: LocalStorageService,
                public modalService: NgbModal,
                public skipLogicValidateService: SkipLogicValidateService) {
    }

    canEditSection() {
        return this.section.edit && !this.isSubForm && this.canEdit;
    }

    checkRepeatOptions() {
        if (this.section.repeat && this.section.repeat[0] === "F" && !NativeRenderService.getFirstQuestion(this.section)) {
            this.alert.addAlert('danger',
                this.section.label + " Repeat on First Question: Value List is not available.");
        }
    }

    copySection(section) {
        this.localStorageService.set("sectionCopied", section);
        section.isCopied = "copied";
        this.elt.isCopied = "copied";
        setTimeout(() => {
            section.isCopied = "clear";
            delete this.elt.isCopied;
        }, 3000);
    }

    editSection(section) {
        if (!this.isSubForm && this.canEdit) {
            section.edit = !section.edit;
            this.formDescriptionComponent.setCurrentEditing(this.parent.formElements, section, this.index);
        }
    }

    getRepeatLabel(section) {
        if (!section.repeat) return "";
        if (section.repeat[0] === "F") return "over First Question";

        return parseInt(section.repeat) + " times";
    }

    static getRepeatOption(section) {
        if (!section.repeat) return "";
        if (section.repeat[0] === "F") return "F";
        else return "N";
    }

    static getRepeatNumber(section) {
        return parseInt(section.repeat);
    }

    getTemplate() {
        return (this.section.elementType === "section" ? this.formDescriptionSectionTmpl : this.formDescriptionFormTmpl);
    }

    hoverInSection(section) {
        if (!this.isSubForm && this.canEdit) {
            section.hover = true;
        }
    }

    hoverOutSection(section) {
        if (!this.isSubForm && this.canEdit) {
            section.hover = false;
        }
    }

    onSelectItem(parent, question, $event, slInput) {
        this.typeaheadSkipLogic(parent, question, $event);
        $event.preventDefault();
        slInput.focus();
        this.slOptionsRetrigger();
    }

    openUpdateFormVersion(formSection: FormInForm) {
        this.formService.fetchForm(formSection.inForm.form.tinyId).then(newForm => {
            let oldVersion = formSection.inForm.form.version ? formSection.inForm.form.version : '';
            this.formService.fetchForm(formSection.inForm.form.tinyId, oldVersion).then(oldForm => {
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

        let modal: any = {
            currentSection: currentSection,
            newSection: newSection
        };
        modal.bForm = true;
        modal.bLabel = !_isEqual(newForm.designations, oldForm.designations);

        this.updateFormVersion =  modal;
        this.modalService.open(this.updateFormVersionTmpl, {size: 'lg'}).result.then(() => {
            currentSection.inForm = newSection.inForm;
            currentSection.formElements = newSection.formElements;
            currentSection.label = newSection.label;
            this.formDescriptionComponent.updateTree();
            this.onEltChange.emit();
        }, _noop);
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.onEltChange.emit();
    }

    setRepeat(section) {
        if (section.repeatOption === "F") {
            section.repeat = "First Question";
            this.onEltChange.emit();
        } else if (section.repeatOption === "N") {
            section.repeat = (section.repeatNumber && section.repeatNumber > 1 ? section.repeatNumber.toString() : undefined);
            if (section.repeat > 0) this.onEltChange.emit();
        }
        else {
            section.repeat = undefined;
        }

        this.checkRepeatOptions();
    }

    slOptionsRetrigger() {
        if (this.slInput) {
            setTimeout(() => {
                this.slInput.nativeElement.dispatchEvent(FormDescriptionSectionComponent.inputEvent);
            }, 0);
        }
    }

    typeaheadSkipLogic(parent, fe, event) {
        if (fe.skipLogic && fe.skipLogic.condition !== event) {
            this.skipLogicValidateService.typeaheadSkipLogic(parent, fe, event);
            this.onEltChange.emit();
        }
    }
}
