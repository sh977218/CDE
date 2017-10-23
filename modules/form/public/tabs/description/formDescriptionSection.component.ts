import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { TreeNode } from "angular-tree-component";
import { LocalStorageService } from 'angular-2-local-storage';

import { AlertService } from '_app/alert/alert.service';
import { FormElement, SkipLogic } from "core/form.model";
import { FormattedValue } from 'core/models.model';
import { FormService } from 'nativeRender/form.service';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { SkipLogicService } from 'nativeRender/skipLogic.service';

@Component({
    selector: "cde-form-description-section",
    templateUrl: "formDescriptionSection.component.html"
})
export class FormDescriptionSectionComponent implements OnInit {
    @Input() elt: any;
    @Input() canEdit: boolean = false;
    @Input() inScoreCdes: any;
    @Input() node: TreeNode;
    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild("formDescriptionSectionTmpl") formDescriptionSectionTmpl: TemplateRef<any>;
    @ViewChild("formDescriptionFormTmpl") formDescriptionFormTmpl: TemplateRef<any>;
    @ViewChild("slInput") slInput: ElementRef;

    isSubForm = false;
    parent: FormElement;
    section: any;

    repeatOptions = [
        {label: "", value: ""},
        {label: "Set Number of Times", value: "N"},
        {label: "Over first question", value: "F"}
    ];

    constructor(private localStorageService: LocalStorageService,
                private alert: AlertService,
                public skipLogicService: SkipLogicService) {
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
        if (this.section.repeat[0] === "F" && !NativeRenderService.getFirstQuestion(this.section))
            this.alert.addAlert('danger',
                this.section.label + " Repeat on First Question: Value List is not available.");
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
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
            this.skipLogicService.getCurrentOptions(term, this.parent.formElements, this.section, this.parent.formElements.indexOf(this.section))
        );

    getTemplate() {
        return (this.section.elementType === "section" ? this.formDescriptionSectionTmpl : this.formDescriptionFormTmpl);
    }

    setRepeat(section) {
        if (section.repeatOption === "F") {
            section.repeat = "First Question";
            this.stageElt.emit();
        } else if (section.repeatOption === "N") {
            section.repeat = (section.repeatNumber && section.repeatNumber > 1 ? section.repeatNumber.toString() : undefined);
            if (section.repeat > 0)
                this.stageElt.emit();
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
        setTimeout(() => {
            this.slInput.nativeElement.dispatchEvent(FormDescriptionSectionComponent.inputEvent);
        }, 0);
    }

    validateSkipLogic(skipLogic, previousQuestions, item) {
        let oldSkipLogic = skipLogic;
        if (oldSkipLogic && oldSkipLogic.condition !== item) {
            let validateSkipLogicResult = this.skipLogicService.validateSkipLogic(skipLogic, previousQuestions, item);
            if (validateSkipLogicResult && skipLogic && skipLogic.condition && skipLogic.condition.trim().length > 0)
                this.stageElt.emit();
            else
                this.isFormValid.emit(false);
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
}
