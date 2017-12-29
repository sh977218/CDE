import {
    Component, ElementRef, EventEmitter, Host, Input, OnInit, Output, TemplateRef,
    ViewChild
} from "@angular/core";
import { Observable } from "rxjs/Observable";
import { TreeNode } from "angular-tree-component";
import { LocalStorageService } from 'angular-2-local-storage';

import { AlertService } from '_app/alert/alert.service';
import { FormElement, FormSection, SkipLogic } from "core/form.model";
import { FormattedValue } from 'core/models.model';
import { FormService } from 'nativeRender/form.service';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { FormDescriptionComponent } from "./formDescription.component";

@Component({
    selector: "cde-form-description-section",
    templateUrl: "formDescriptionSection.component.html"
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

    isSubForm = false;
    parent: FormElement;
    section: FormSection;

    repeatOptions = [
        {label: "", value: ""},
        {label: "Set Number of Times", value: "N"},
        {label: "Over first question", value: "F"}
    ];

    constructor(@Host() public formDescriptionComponent: FormDescriptionComponent,
                private localStorageService: LocalStorageService,
                private alert: AlertService,
                public skipLogicValidateService: SkipLogicValidateService) {
    }

    ngOnInit() {
        this.section = this.node.data;
        this.parent = this.node.parent.data;
        this.section.repeatOption = FormDescriptionSectionComponent.getRepeatOption(this.section);
        this.section.repeatNumber = FormDescriptionSectionComponent.getRepeatNumber(this.section);
        if (!this.section.instructions)
            this.section.instructions = new FormattedValue;
        if (!this.section.skipLogic)
            this.section.skipLogic = new SkipLogic;

        if (this.node.data.elementType === "form") {
            if (FormService.isSubForm(this.node.parent))
                this.isSubForm = FormService.isSubForm(this.node);
        } else {
            if (FormService.isSubForm(this.node))
                this.isSubForm = FormService.isSubForm(this.node);
        }

        this.checkRepeatOptions();
    }

    canEditSection() {
        return this.section.edit && !this.isSubForm && this.canEdit;
    }

    checkRepeatOptions() {
        if (this.section.repeat && this.section.repeat[0] === "F" && !NativeRenderService.getFirstQuestion(this.section))
            this.alert.addAlert('danger',
                this.section.label + " Repeat on First Question: Value List is not available.");
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.onEltChange.emit();
    }

    static getRepeatOption(section) {
        if (!section.repeat)
            return "";
        if (section.repeat[0] === "F")
            return "F";
        else
            return "N";
    }

    static getRepeatNumber(section) {
        return parseInt(section.repeat);
    }

    getSkipLogicOptions = (text$: Observable<string>) =>
        text$.debounceTime(300).map(term =>
            this.skipLogicValidateService.getTypeaheadOptions(term, this.parent, this.section)
        );

    getTemplate() {
        return (this.section.elementType === "section" ? this.formDescriptionSectionTmpl : this.formDescriptionFormTmpl);
    }

    setRepeat(section) {
        if (section.repeatOption === "F") {
            section.repeat = "First Question";
            this.onEltChange.emit();
        } else if (section.repeatOption === "N") {
            section.repeat = (section.repeatNumber && section.repeatNumber > 1 ? section.repeatNumber.toString() : undefined);
            if (section.repeat > 0)
                this.onEltChange.emit();
        }
        else {
            section.repeat = undefined;
        }

        this.checkRepeatOptions();
    }

    getRepeatLabel(section) {
        if (!section.repeat)
            return "";
        if (section.repeat[0] === "F")
            return "over First Question";

        return parseInt(section.repeat) + " times";
    }

    slOptionsRetrigger() {
        if (this.slInput)
            setTimeout(() => {
                this.slInput.nativeElement.dispatchEvent(FormDescriptionSectionComponent.inputEvent);
            }, 0);
    }

    typeaheadSkipLogic(parent, fe, event) {
        if (fe.skipLogic && fe.skipLogic.condition !== event) {
            this.skipLogicValidateService.typeaheadSkipLogic(parent, fe, event);
            this.onEltChange.emit();
        }
    }

    static inputEvent = new Event('input');

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
        section.edit = !section.edit;
        if (this.formDescriptionComponent.formElementEditing) {
            this.formDescriptionComponent.formElementEditing.formElement.edit = false;
        }
        this.formDescriptionComponent.formElementEditing = {
            formElements: this.parent.formElements,
            index: this.index,
            formElement: section
        };
    }
}
