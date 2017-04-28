import { Component, EventEmitter, Inject, Input, OnInit, Output } from "@angular/core";
import { Http, Response } from "@angular/http";

@Component({
    selector: "cde-form-description",
    templateUrl: "formDescription.component.html",
    styles: [`
        :host >>> .panel {
            margin-bottom: 1px
        }
        :host >>> .tree-children {
            padding-left: 0
        }
        :host >>> .node-drop-slot {
            height: 10px;
            margin-bottom: 1px
        }
        :host >>> .panel-badge-btn {
            color: white;
            background-color: #333
        }
    `]
})
export class FormDescriptionComponent implements OnInit {
    @Input() elt: any;
    @Input() inScoreCdes: any;
    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() setToNoneAddMode: EventEmitter<void> = new EventEmitter<void>();
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    canCurate = false;

    treeOptions = {
        allowDrag: true,
        allowDrop: (element, {parent, index}) => true,
        childrenField: "formElements",
        displayField: "label",
        dropSlotHeight: 3,
        isExpandedField: "id"
    };
    id = 0;

    constructor(private http: Http,
                @Inject("isAllowedModel") public isAllowedModel) {}

    ngOnInit() {
        this.canCurate = this.isAllowedModel.isAllowed(this.elt);
    }
    addSectionTop() {
        if (!this.elt.formElements) {
            this.elt.formElements = [];
        }

        this.elt.formElements.unshift({
            label: "New Section",
            cardinality: {min: 1, max: 1},
            section: {},
            skipLogic: {condition: ''},
            formElements: [],
            elementType: "section"
        });
        this.stageElt.emit();
    }

    addSectionBottom(po) {
        if (!this.elt.formElements) {
            this.elt.formElements = [];
        }
        this.elt.formElements.push({
            label: "New Section",
            cardinality: {min: 1, max: 1},
            section: {},
            skipLogic: {condition: ''},
            formElements: [],
            elementType: "section"
        });
        this.stageElt.emit();
    }

    // sortableOptionsSections = {
    //     connectWith: ".dragSections",
    //     handle: ".fa.fa-arrows",
    //     revert: true,
    //     placeholder: "questionPlaceholder",
    //     start: function (event, ui) {
    //         $('.dragQuestions').css('border', '2px dashed grey');
    //         ui.placeholder.height("20px");
    //     },
    //     stop: function () {
    //         $('.dragQuestions').css('border', '');
    //     },
    //     receive: function (e, ui) {
    //         if (!ui.item.sortable.moved) {
    //             ui.item.sortable.cancel();
    //             return;
    //         }
    //         if (ui.item.sortable.moved.tinyId || ui.item.sortable.moved.elementType === "question")
    //             ui.item.sortable.cancel();
    //     },
    //     helper: function () {
    //         return $('<div class="placeholderForDrop"><i class="fa fa-arrows"></i> Drop Me</div>')
    //     }
    // };
    //
    // sortableOptions = {
    //     connectWith: ".dragQuestions",
    //     handle: ".fa.fa-arrows",
    //     revert: true,
    //     placeholder: "questionPlaceholder",
    //     start: function (event, ui) {
    //         $('.dragQuestions').css('border', '2px dashed grey');
    //         ui.placeholder.height("20px");
    //     },
    //     stop: function () {
    //         $('.dragQuestions').css('border', '');
    //     },
    //     helper: function () {
    //         return $('<div class="placeholderForDrop"><i class="fa fa-arrows"></i> Drop Me</div>')
    //     },
    //     receive: function (e, ui) {
    //         let elt = ui.item.sortable.moved;
    //         if (elt.valueDomain) {
    //             this.convertCdeToQuestion(elt, function (question) {
    //                 ui.item.sortable.moved = question;
    //             });
    //         } else if (elt.naming) {
    //             ui.item.sortable.moved = FormDescriptionComponent.convertFormToSection(elt);
    //         }
    //         this.stageElt.emit();
    //     },
    //     update: function () {
    //         this.stageElt.emit();
    //     }
    // };
}