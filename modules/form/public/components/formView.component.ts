import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule, NgbTabset } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { QuickBoardListService } from "quickBoard/public/quickBoardList.service";
import { UserService } from 'core/public/user.service';
import { IsAllowedService } from 'core/public/isAllowed.service';
import { SaveModalComponent } from 'adminItem/public/components/saveModal/saveModal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '_app/alert/alert.service';
import { OrgHelperService } from 'core/public/orgHelper.service';

@Component({
    selector: "cde-form-view",
    templateUrl: "formView.component.html",
    styles: [`
        .marginTopBottom5 {
            margin: 5px 0
        }

        #leftNav {
            z-index: 1;
        }

        .mobileViewH1 {
            font-size: 20px;
        }
    `]
})
export class FormViewComponent implements OnInit {
    @ViewChild("copyFormContent") public copyFormContent: NgbModalModule;
    @ViewChild("publishFormContent") public publishFormContent: NgbModalModule;
    @ViewChild("commentAreaComponent") public commentAreaComponent: DiscussAreaComponent;
    @ViewChild("mltPinModalCde") public mltPinModalCde: PinBoardModalComponent;
    @ViewChild("saveModal") public saveModal: SaveModalComponent;
    @Input() routeParams: any;
    @Input() missingCdes = [];
    @Input() inScoreCdes = [];
    @Output() public h = new EventEmitter();

    public elt: any;
    public eltCopy = {};
    public modalRef: NgbModalRef;
    hasComments;
    commentMode;
    currentTab = "general_tab";
    highlightedTabs = [];
    canEdit: boolean = false;
    isFormValid = true;
    formInput;
    drafts = [];
    orgNamingTags = [];
    formId;
    currentView = "nativeRender";
    mobileView: boolean = false;

    constructor(private http: Http,
                private ref: ChangeDetectorRef,
                public modalService: NgbModal,
                public isAllowedModel: IsAllowedService,
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private alert: AlertService,
                public userService: UserService,
                private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit() {
        this.route.queryParams.subscribe(() => {
            this.loadForm(form => {
                this.userService.then(() => {
                    this.orgHelperService.then(() => {
                        let user = this.userService.user;
                        if (user && user.username) {
                            this.loadComments(form, null);
                            this.loadDraft(() => this.canEdit = this.isAllowedModel.isAllowed(this.elt));
                        }
                        else this.canEdit = this.isAllowedModel.isAllowed(this.elt);
                        let allNamingTags = this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name].nameTags;
                        this.elt.naming.forEach(n => {
                            n.tags.forEach(t => {
                                allNamingTags.push(t);
                            });
                        });
                        this.orgNamingTags = _.uniqWith(allNamingTags, _.isEqual).map(t => {
                            return {id: t, text: t};
                        });
                    });
                    if (window.innerWidth <= 800)
                        this.mobileView = true;
                });
            });
        });
    }

    loadForm(cb) {
        let formId = this.route.snapshot.queryParams['formId'];
        let url = "/form/" + this.route.snapshot.queryParams['tinyId'];
        if (formId) url = "/formById/" + formId;
        this.http.get(url).map(res => res.json()).subscribe(res => {
                this.elt = res;
                this.formId = this.elt._id;
                this.userService.then(() => {
                    this.areDerivationRulesSatisfied();
                    this.canEdit = this.isAllowedModel.isAllowed(this.elt)
                });
                cb(this.elt);
            },
            () => this.router.navigate(['/pageNotFound'])
        );
    }

    loadComments(form, cb) {
        this.http.get("/comments/eltId/" + form.tinyId)
            .map(res => res.json()).subscribe(res => {
            this.hasComments = res && (res.length > 0);
            if (cb) cb();
        }, err => this.alert.addAlert("danger", "Error loading comments. " + err));
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
            () => {
                this.userService.reload();
                this.alert.addAlert("info", "Done. Go to your profile to see all your published forms");
                this.modalRef.close();
            }, err => {
                this.alert.addAlert("danger", "Error when publishing form. " + err);
                this.modalRef.close();
            });
    }

    pinAllCdesIntoBoard() {
        let cdes = [];
        let doFormElement = formElt => {
            if (formElt.elementType === 'question')
                cdes.push(formElt.question.cde);
            else if (formElt.elementType === 'section' || formElt.elementType === 'form')
                formElt.formElements.forEach(doFormElement);
        };
        this.elt.formElements.forEach(doFormElement);
        this.mltPinModalCde.pinMultiple(cdes, this.mltPinModalCde.open());
    }

    isIe() {
        let userAgent = window.navigator.userAgent;
        return /internet explorer/i.test(userAgent);
    }

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    setIsValid(valid) {
        this.isFormValid = valid;
    }

    areDerivationRulesSatisfied() {
        this.missingCdes = [];
        this.inScoreCdes = [];
        let allCdes = {};
        let allQuestions = [];
        let doFormElement = function (formElt) {
            if (formElt.elementType === 'question') {
                if (formElt.question.datatype === 'Number' && !Number.isNaN(formElt.question.defaultAnswer))
                    formElt.question.answer = Number.parseFloat(formElt.question.defaultAnswer);
                else formElt.question.answer = formElt.question.defaultAnswer;
                allCdes[formElt.question.cde.tinyId] = formElt.question.cde;
                allQuestions.push(formElt);
            } else if (formElt.elementType === 'section' || formElt.elementType === 'form') {
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

    removeAttachment(event) {
        this.http.post("/attachments/form/remove", {
            index: event,
            id: this.elt._id
        }).map(r => r.json()).subscribe(res => {
            this.elt = res;
            this.alert.addAlert("success", "Attachment Removed.");
            this.ref.detectChanges();
        });
    }

    setDefault(index) {
        this.http.post("/attachments/form/setDefault",
            {
                index: index,
                state: this.elt.attachments[index].isDefault,
                id: this.elt._id
            }).map(r => r.json()).subscribe(res => {
            this.elt = res;
            this.alert.addAlert("success", "Saved");
            this.ref.detectChanges();
        });
    }

    upload(event) {
        if (event.srcElement.files) {
            let files = event.srcElement.files;
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append("uploadedFiles", files[i]);
            }
            formData.append("id", this.elt._id);
            this.http.post("/attachments/form/add", formData).map(r => r.json()).subscribe(
                r => {
                    if (r.message) this.alert.addAlert("info", r.text());
                    else {
                        this.elt = r;
                        this.alert.addAlert("success", "Attachment added.");
                        this.ref.detectChanges();
                    }
                }
            );
        }
    }

    loadDraft(cb) {
        this.http.get("/draftForm/" + this.elt.tinyId)
            .map(res => res.json()).subscribe(res => {
            if (res && res.length > 0) {
                this.drafts = res;
                this.elt = res[0];
            } else this.drafts = [];
            if (cb) cb();
        }, err => this.alert.addAlert("danger", err));
    }

    saveDraft(cb) {
        this.elt._id = this.formId;
        this.http.post("/draftForm/" + this.elt.tinyId, this.elt)
            .map(res => res.json()).subscribe(res => {
            this.elt.isDraft = true;
            this.areDerivationRulesSatisfied();
            this.validateForm();
            if (cb) cb(res);
        }, err => this.alert.addAlert("danger", err));
    }

    saveForm() {
        this.http.put("/form/" + this.elt.tinyId, this.elt)
            .map(res => res.json()).subscribe(res => {
            if (res) {
                this.loadForm(() => this.alert.addAlert("success", "Form saved."));
                this.loadDraft(null);
            }
        }, err => this.router.navigate(['/pageNotFound']));
    }

    removeDraft() {
        this.http.delete("/draftForm/" + this.elt.tinyId)
            .subscribe(res => {
                if (res) this.loadForm(() => this.drafts = []);
            }, err => this.alert.addAlert("danger", err));
    }

}
