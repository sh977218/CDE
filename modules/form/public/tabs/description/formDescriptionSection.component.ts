import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild
} from "@angular/core";
import { Observable } from "rxjs/Observable";
import { TreeNode } from "angular-tree-component";
import { LocalStorageService } from 'angular-2-local-storage';

import { FormService } from "../../form.service";
import { FormElement, SkipLogic } from "../../form.model";
import { FormattedValue } from "../../../../core/public/models.model";
import { SkipLogicService } from "../../skipLogic.service";

@Component({
    selector: "cde-form-description-section",
    templateUrl: "formDescriptionSection.component.html"
})
export class FormDescriptionSectionComponent implements OnInit {
    @Input() elt: any;
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
                @Inject("isAllowedModel") public isAllowedModel,
                public skipLogicService: SkipLogicService) {
    }

    ngOnInit() {
        this.section = this.node.data;
        this.parent = this.node.parent.data;
        this.section.repeatOption = FormDescriptionSectionComponent.getRepeatOption(this.section);
        this.section.repeatNumber = this.getRepeatNumber(this.section);
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
    }

    canEdit() {
        return this.section.edit && !this.isSubForm && this.isAllowedModel.isAllowed(this.elt);
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

    getRepeatNumber(section) {
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
        if (section.repeatOption === "F")
            section.repeat = "First Question";
        else if (section.repeatOption === "N")
            section.repeat = (section.repeatNumber && section.repeatNumber > 1 ? section.repeatNumber.toString() : undefined);
        else
            section.repeat = undefined;
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
        if (this.skipLogicService.validateSkipLogic(skipLogic, previousQuestions, item))
            this.stageElt.emit();
        else
            this.isFormValid.emit(false);
    }

    static inputEvent = new Event('input');

    copySection(section, event) {
        this.localStorageService.set("sectionCopied", section);
        section.isCopied = "copied";
        this.elt.isCopied = "copied";
        setTimeout(() => {
            section.isCopied = "clear";
            delete this.elt.isCopied;
        }, 3000);
    }
}
