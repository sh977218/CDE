import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { AlertService } from "../../../system/public/components/alert/alert.service";
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import * as formShared from '../../shared/formShared.js';
import { CdeForm } from 'form/public/form.model';
import { PinModalComponent } from 'board/public/components/pinModal/pinModal.component';

@Component({
    selector: "cde-form-view",
    templateUrl: "formView.component.html"
})
export class FormViewComponent implements OnInit {
    @ViewChild("copyFormContent") public copyFormContent: NgbModalModule;
    @ViewChild("publishFormContent") public publishFormContent: NgbModalModule;
    @ViewChild("commentAreaComponent") public commentAreaComponent: DiscussAreaComponent;
    @ViewChild("mltPinModal") public mltPinModal: PinModalComponent;
    @Input() elt: any;
    @Input() missingCdes = [];
    @Input() inScoreCdes = [];
    @Output() public stageElt = new EventEmitter();
    @Output() public reload = new EventEmitter();

    public eltCopy = {};
    public modalRef: NgbModalRef;
    hasComments;
    commentMode;
    eltLoaded: boolean = false;
    currentTab = "general_tab";
    highlightedTabs = [];
    cdes = [];
    isFormValid = true;

    formInput;

    constructor(private http: Http,
                public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("FormQuickBoard") public quickBoard,
                @Inject("PinModal") public PinModal,
                private alert: AlertService,
                @Inject("userResource") public userService) {
    }

    ngOnInit(): void {
        this.areDerivationRulesSatisfied();
        this.http.get("/comments/eltId/" + this.elt.tinyId)
            .map(res => res.json()).subscribe(
            res => this.hasComments = res && (res.length > 0),
            err => this.alert.addAlert("danger", "Error on loading comments. " + err)
        )
    }

    openCopyElementModal() {
        this.eltCopy = _.cloneDeep(this.elt);
        this.eltCopy["classification"] = this.elt.classification.filter(c => {
            return this.userService.userOrgs.indexOf(c.stewardOrg.name) !== -1;
        });
        this.eltCopy["registrationState.administrativeNote"] = "Copy of: " + this.elt.tinyId;
        delete this.eltCopy["tinyId"];
        delete this.eltCopy["_id"];
        delete this.eltCopy["origin"];
        delete this.eltCopy["created"];
        delete this.eltCopy["updated"];
        delete this.eltCopy["imported"];
        delete this.eltCopy["updatedBy"];
        delete this.eltCopy["createdBy"];
        delete this.eltCopy["version"];
        delete this.eltCopy["history"];
        delete this.eltCopy["changeNote"];
        delete this.eltCopy["comments"];
        delete this.eltCopy["forkOf"];
        delete this.eltCopy["views"];
        this.eltCopy["ids"] = [];
        this.eltCopy["sources"] = [];
        this.eltCopy["naming"][0].designation = "Copy of: " + this.eltCopy["naming"][0].designation;
        this.eltCopy["registrationState"] = {
            registrationStatus: "Incomplete",
            administrativeNote: "Copy of: " + this.elt.tinyId
        };
        this.modalRef = this.modalService.open(this.copyFormContent, {size: "lg"});
    }

    closeCopyFormModal() {
        this.modalRef.close();
    }

    beforeChange(event) {
        this.currentTab = event.nextId;
        if (this.commentMode)
            this.commentAreaComponent.setCurrentTab(this.currentTab);
    }

    openPreparePublishModal() {
        this.formInput = {};
        this.modalRef = this.modalService.open(this.publishFormContent, {size: "lg"});
    };

    publishForm() {
        this.http.post("/form/publish/" + this.elt._id, {
            publishedFormName: this.formInput.publishedFormName,
            endpointUrl: this.formInput.endpointUrl
        }).subscribe(
            res => {
                this.alert.addAlert("info", "Done. Go to your profile to see all your published forms");
                this.modalRef.close();
            }, err => {
                this.alert.addAlert("danger", "Error when publishing form. " + err);
                this.modalRef.close();
            });
    }

    pinAllCdesIntoBoard() {
        this.cdes = [];
        let doFormElement = formElt => {
            if (formElt.elementType === 'question') {
                this.cdes.push(formElt.question.cde);
            } else if (formElt.elementType === 'section' || formElt.elementType === 'form') {
                formElt.formElements.forEach(doFormElement);
            }
        };
        this.elt.formElements.forEach(doFormElement);
        this.mltPinModal.open(this.cdes, "cde");
    }

    isIe() {
        let userAgent = window.navigator.userAgent;
        if (/internet explorer/i.test(userAgent)) return true;
        else return false;
    }

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    setIsValid(valid) {
        this.isFormValid = valid;
    }

    doStageElt() {
        this.areDerivationRulesSatisfied();
        this.validateForm();
        this.elt.unsaved = true;
    }

    areDerivationRulesSatisfied() {
        this.missingCdes = [];
        this.inScoreCdes = [];
        let allCdes = {};
        let allQuestions = [];
        let doFormElement = function (formElt) {
            if (formElt.elementType === 'question') {
                allCdes[formElt.question.cde.tinyId] = formElt.question.cde;
                allQuestions.push(formElt);
            } else if (formElt.elementType === 'section') {
                formElt.formElements.forEach(doFormElement);
            }
        };
        this.elt.formElements.forEach(doFormElement);
        allQuestions.forEach(quest => {
            if (quest.question.cde.derivationRules)
                quest.question.cde.derivationRules.forEach(derRule => {
                    delete quest.incompleteRule;
                    if (derRule.ruleType === 'score') {
                        quest.question.isScore = true;
                        quest.question.scoreFormula = derRule.formula;
                        this.inScoreCdes = derRule.inputs;
                    }
                    derRule.inputs.forEach(input => {
                        if (!allCdes[input]) {
                            this.missingCdes.push({tinyId: input});
                            quest.incompleteRule = true;
                        }
                    });
                });
        });
    };

    validateForm() {
        this.isFormValid = true;
        let loopFormElements = form => {
            if (form.formElements) {
                form.formElements.forEach(fe => {
                    if (fe.skipLogic && fe.skipLogic.validationError) {
                        this.isFormValid = false;
                        return;
                    }
                    loopFormElements(fe);
                });
            }
        };
        loopFormElements(this.elt);
    };
}