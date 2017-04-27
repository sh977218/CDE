import { Component, EventEmitter, Inject, Input, OnInit, Output } from "@angular/core";
import { Http, Response } from "@angular/http";

@Component({
    selector: "cde-form-description",
    templateUrl: "formDescription.component.html",
    styles: [
        ":host >>> .panel {margin-bottom: 1px}",
        ":host >>> .tree-children {padding-left: 0}",
        ":host >>> .node-drop-slot {height: 10px; margin-bottom: 1px}",
        ":host >>> .panel-badge-btn {color: white; background-color: #333}"
    ]
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

    //
    // addSectionTop() {
    //     if (!this.elt.formElements) {
    //         this.elt.formElements = [];
    //     }
    //
    //     this.elt.formElements.unshift({
    //         label: "New Section",
    //         cardinality: {min: 1, max: 1},
    //         section: {},
    //         skipLogic: {condition: ''},
    //         formElements: [],
    //         elementType: "section"
    //     });
    //     this.stageElt.emit();
    // }
    //
    // addSectionBottom(po) {
    //     if (!this.elt.formElements) {
    //         this.elt.formElements = [];
    //     }
    //     this.elt.formElements.push({
    //         label: "New Section",
    //         cardinality: {min: 1, max: 1},
    //         section: {},
    //         skipLogic: {condition: ''},
    //         formElements: [],
    //         elementType: "section"
    //     });
    //     this.stageElt.emit();
    // }
    //
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
    // convertCdeToQuestion(cde, cb) {
    //     if (cde.valueDomain !== undefined) {
    //         let question = {
    //             elementType: "question",
    //             label: cde.naming[0].designation,
    //             cardinality: {min: 1, max: 1},
    //             skipLogic: {
    //                 condition: ''
    //             },
    //             question: {
    //                 cde: {
    //                     tinyId: cde.tinyId,
    //                     version: cde.version,
    //                     derivationRules: cde.derivationRules,
    //                     name: cde.naming[0] ? cde.naming[0].designation : '',
    //                     ids: cde.ids ? cde.ids : [],
    //                     permissibleValues: []
    //                 },
    //                 datatype: cde.valueDomain.datatype,
    //                 required: false,
    //                 uoms: cde.valueDomain.uom ? [cde.valueDomain.uom] : [],
    //                 answers: []
    //             }
    //         };
    //         cde.naming.forEach(function (n) {
    //             if (!n.tags) n.tags = [];
    //             if (n.tags.filter(function (t) {
    //                     return t.tag.toLowerCase().indexOf('Question Text') > 0;
    //                 }).length > 0) {
    //                 if (!n.designation || (n.designation && n.designation.trim().length === 0)) {
    //                     question.label = cde.naming[0].designation ? cde.naming[0].designation : '';
    //                     question.hideLabel = true;
    //                 } else {
    //                     question.label = n.designation;
    //                 }
    //             }
    //         });
    //
    //         if (question.question.datatype === 'Number') {
    //             question.question.datatypeNumber = cde.valueDomain.datatypeNumber ? cde.valueDomain.datatypeNumber : {};
    //         } else if (question.question.datatype === 'Text') {
    //             question.question.datatypeText = cde.valueDomain.datatypeText ? cde.valueDomain.datatypeText : {};
    //         } else if (question.question.datatype === 'Date') {
    //             question.question.datatypeDate = cde.valueDomain.datatypeDate ? cde.valueDomain.datatypeDate : {};
    //         } else if (question.question.datatype === 'Value List') {
    //             if (cde.valueDomain.permissibleValues.length > 0) {
    //                 // elastic only store 10 pv, retrieve pv when have more than 9 pv.
    //                 if (cde.valueDomain.permissibleValues.length > 9) {
    //                     this.http.get("/debytinyid/" + cde.tinyId + "/" + (cde.version ? cde.version : ""))
    //                         .map((res: Response) => res.json())
    //                         .subscribe((result) => {
    //                             result.data.valueDomain.permissibleValues.forEach(function (pv) {
    //                                 if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
    //                                     pv.valueMeaningName = pv.permissibleValue;
    //                                 }
    //                                 question.question.answers.push(pv);
    //                                 question.question.cde.permissibleValues.push(pv);
    //                             });
    //                             cb(question);
    //                         });
    //                 } else {
    //                     cde.valueDomain.permissibleValues.forEach(function (pv) {
    //                         if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
    //                             pv.valueMeaningName = pv.permissibleValue;
    //                         }
    //                         question.question.answers.push(pv);
    //                         question.question.cde.permissibleValues.push(pv);
    //                     });
    //                 }
    //             }
    //         } else {
    //             console.log('Unknown CDE datatype: ' + cde.valueDomain.datatype);
    //         }
    //         return cb(question);
    //     }
    //     else {
    //         return cb({});
    //     }
    // }
    //
    // static convertFormToSection(form) {
    //     if (form.formElements)
    //         return {
    //             elementType: "form",
    //             label: form.naming[0] ? form.naming[0].designation : '',
    //             skipLogic: {
    //                 condition: ''
    //             },
    //             inForm: {
    //                 form: {
    //                     tinyId: form.tinyId,
    //                     version: form.version,
    //                     name: form.naming[0] ? form.naming[0].designation : ''
    //                 }
    //             }
    //         };
    //     else
    //         return {};
    // }
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
    //
    // aaaaaaaaaaaaaselectQuestionNameModal(question, section) {
    //     var cde = question.question.cde;
    //     var url = "/debytinyid/" + cde.tinyId;
    //     if (cde.version) url += "/" + cde.version;
    //     this.http.get(url).map((res: Response) => res.json())
    //         .subscribe((response) => {
    //             cde = response.data;
    //         }, undefined, () => {
    //             cde = "error";
    //         });
    //
    //     function checkAndUpdateLabel(section, doUpdate, selectedNaming) {
    //         section.formElements.forEach(function (fe) {
    //             if (fe.skipLogic && fe.skipLogic.condition) {
    //                 let updateSkipLogic = false;
    //                 let tokens = SkipLogicUtil.tokenSplitter(fe.skipLogic.condition);
    //                 tokens.forEach(function (token, i) {
    //                     if (i % 2 === 0 && token === question.label) {
    //                         $scope.updateSkipLogic = true;
    //                         updateSkipLogic = true;
    //                         if (doUpdate && selectedNaming)
    //                             tokens[i] = '"' + selectedNaming + '"';
    //                     } else if (i % 2 === 0 && token !== question.label)
    //                         tokens[i] = '"' + tokens[i] + '"';
    //                 });
    //                 if (doUpdate && updateSkipLogic) {
    //                     fe.skipLogic.condition = tokens.join('');
    //                     fe.updatedSkipLogic = true;
    //                 }
    //             }
    //         });
    //     }
    //
    //     checkAndUpdateLabel(section);
    //
    //     function okSelect(naming) {
    //         if (!naming) {
    //             question.label = "";
    //             question.hideLabel = true;
    //         }
    //         else {
    //             checkAndUpdateLabel(section, true, naming.designation);
    //             question.label = naming.designation;
    //             question.hideLabel = false;
    //         }
    //         $modalInstance.close();
    //     }
    // }
    //
    // removeElt(form, index) {
    //     form.formElements.splice(index, 1);
    //     this.stageElt.emit();
    //
    //     if (form.formElements.length === 0) {
    //         this.setToNoneAddMode.emit();
    //     }
    // };
    //
    // removeQuestion(section, index) {
    //     section.formElements.splice(index, 1);
    //     this.stageElt.emit();
    // };
    //
    // moveElt(index, inc) {
    //     this.elt.formElements.splice(index + inc, 0, this.elt.formElements.splice(index, 1)[0]);
    //     this.stageElt.emit();
    // };
    //
    // updateCdeVersion(question) {
    //     this.http.get('/deByTinyId/' + question.question.cde.tinyId).map((res: Response) => res.json())
    //         .subscribe((response) => {
    //             this.convertCdeToQuestion(response.data, function (newQuestion) {
    //                 $modal.open({
    //                     animation: false,
    //                     resolve: {
    //                         newQuestion: function () {
    //                             return newQuestion;
    //                         },
    //                         currentQuestion: function () {
    //                             return question;
    //                         }
    //                     }
    //                 }).result.then(function () {
    //                     question.question = newQuestion.question;
    //                     question.label = newQuestion.label;
    //                     this.stageElt.emit();
    //                 });
    //             });
    //         });
    // }
    //
    // aaaaaaaaaaaaupdateRefVersionModal(currentQuestion, newQuestion) {
    //     function emptyStringToNull(convert) {
    //         if (convert === '')
    //             return null;
    //         else
    //             return convert;
    //     }
    //
    //     this.http.get("/debytinyid/" + newQuestion.question.cde.tinyId).map((res: Response) => res.json())
    //         .subscribe((newCde) => {
    //             var cdeUrl = currentQuestion.question.cde.tinyId +
    //                 (currentQuestion.question.cde.version ? "/" + currentQuestion.question.cde.version : "");
    //             this.http.get("/debytinyid/" + cdeUrl).map((res: Response) => res.json())
    //                 .subscribe((oldCde) => {
    //                 bLabel = !angular.equals(newCde.data.naming, oldCde.data.naming);
    //             });
    //             var found = false;
    //             newCde.data.naming.forEach(function (result) {
    //                 if (result.designation == currentQuestion.label) found = true;
    //             });
    //             if (found) newQuestion.label = currentQuestion.label;
    //         });
    //     bDatatype = currentQuestion.question.datatype != newQuestion.question.datatype;
    //     bUom = !angular.equals(currentQuestion.question.uoms, newQuestion.question.uoms);
    //     bDefault = emptyStringToNull(currentQuestion.question.defaultAnswer)
    //         != emptyStringToNull(newQuestion.question.defaultAnswer);
    //     bCde = true;
    //     if (newQuestion.question.datatype === "Number") {
    //         if (currentQuestion.question.datatype === "Number" &&
    //             currentQuestion.question.datatypeNumber &&
    //             newQuestion.question.datatypeNumber) {
    //             bNumberMin = currentQuestion.question.datatypeNumber.minValue
    //                 != newQuestion.question.datatypeNumber.minValue;
    //             bNumberMax = currentQuestion.question.datatypeNumber.maxValue
    //                 != newQuestion.question.datatypeNumber.maxValue;
    //         } else {
    //             bNumberMin = bNumberMax = true;
    //         }
    //     }
    //     if (newQuestion.question.datatype === "Value List") {
    //         if (currentQuestion.question.datatype === "Value List") {
    //             bMulti = currentQuestion.question.multiselect != newQuestion.question.multiselect;
    //             bValuelist = !angular.equals(currentQuestion.question.cde.permissibleValues,
    //                 newQuestion.question.cde.permissibleValues);
    //             if (!bValuelist) newQuestion.question.answers = currentQuestion.question.answers;
    //         } else {
    //             bMulti = bValuelist = true;
    //         }
    //     }
    // }
    // updateSkipLogic (section) {
    //     if (!section.skipLogic)
    //         return;
    //     section.skipLogic.condition = "'" + section.skipLogic.condition1 + "'='" + section.skipLogic.condition3 + "'";
    //     this.stageElt.emit();
    // }
}