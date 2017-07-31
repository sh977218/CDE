import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { AlertService } from "../../../system/public/components/alert/alert.service";
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import * as formShared from '../../shared/formShared.js';

@Component({
    selector: "cde-form-view",
    templateUrl: "formView.component.html"
})
export class FormViewComponent implements OnInit {
    @ViewChild("copyFormContent") public copyFormContent: NgbModalModule;
    @ViewChild("publishFormContent") public publishFormContent: NgbModalModule;
    @ViewChild("commentAreaComponent") public commentAreaComponent: DiscussAreaComponent;
    @Input() elt: any;
    public eltCopy = {};
    public modalRef: NgbModalRef;
    commentMode;
    eltLoaded: boolean = false;
    currentTab = "general_tab";
    highlightedTabs = [];
    cdes = [];
    isFormValid = true;
    missingCdes;
    inScoreCdes;

    formInput;

    constructor(private http: Http,
                public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("FormQuickBoard") public quickBoard,
                @Inject("PinModal") public PinModal,
                private alert: AlertService) {
    }

    // remove it once has angular2 route
    getParameterByName(name, url = null) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    ngOnInit(): void {
        let tinyId = this.getParameterByName("tinyId");
        let cdeId = this.getParameterByName("cdeId");
        let url;
        if (tinyId) {
            url = "/form/" + tinyId;
        }
        if (cdeId) {
            url = "/formById/" + cdeId;
        }
        this.http.get(url).map(res => res.json()).subscribe(res => {
            if (res) {
                this.elt = res;
                this.areDerivationRulesSatisfied();
                this.cdes = formShared.getFormCdes(this.elt);
                this.eltLoaded = true;
            } else
                this.alert.addAlert("danger", "Sorry, we are unable to retrieve this data element.");
        }, err =>
            this.alert.addAlert("danger", "Sorry, we are unable to retrieve this form." + err));
    }

    openCopyElementModal() {
        this.eltCopy = _.cloneDeep(this.elt);
        delete this.eltCopy["_id"];
        delete this.eltCopy["tinyId"];
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

    reload() {
        this.http.get("/form/" + this.elt.tinyId).map(res => res.json()).subscribe(res => {
            if (res) {
                this.elt = res;

                this.alert.addAlert("success", "Changes discarded.");
            } else this.alert.addAlert("danger", "Sorry, we are unable to retrieve this form.");
        }, err => this.alert.addAlert("danger", err));
    }

    saveForm() {
        if (!this.elt.isCopyrighted) this.elt.copyright = {text: "", authority: ""};
        this.http.put("/form/" + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
            if (res) {
                this.elt = res;
                this.alert.addAlert("success", "Form saved.");
            }
        }, err => this.alert.addAlert("danger", err));
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

    stageElt() {
        this.areDerivationRulesSatisfied();
        this.validateForm();
        this.elt.unsaved = true;
    }

    areDerivationRulesSatisfied = function () {
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
        allQuestions.forEach(function (quest) {
            if (quest.question.cde.derivationRules)
                quest.question.cde.derivationRules.forEach(function (derRule) {
                    delete quest.incompleteRule;
                    if (derRule.ruleType === 'score') {
                        quest.question.isScore = true;
                        quest.question.scoreFormula = derRule.formula;
                        this.inScoreCdes = derRule.inputs;
                    }
                    derRule.inputs.forEach(function (input) {
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
        var loopFormElements = function (form) {
            if (form.formElements) {
                form.formElements.forEach(function (fe) {
                    if (fe.skipLogic && fe.skipLogic.error) {
                        this.isFormValid = false;
                        return;
                    }
                    loopFormElements(fe);
                })
            }
        };
        loopFormElements(this.elt);
    };
}