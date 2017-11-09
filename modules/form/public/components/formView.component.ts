import {
    ChangeDetectorRef, Component, HostListener, OnInit, ViewChild
} from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { FormService } from 'nativeRender/form.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { QuickBoardListService } from "_app/quickBoardList.service";
import { UserService } from '_app/user.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { SaveModalComponent } from 'adminItem/public/components/saveModal/saveModal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '_app/alert/alert.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: "cde-form-view",
    templateUrl: "formView.component.html",
    styles: [`
        .marginTopBottom5 {
            margin: 5px 0
        }

        #leftNav {
            margin-top: 20px;
            z-index: 1;
        }

        @media (max-width: 767px) {
            .mobileViewH1 {
                font-size: 20px;
            }
        }
    `]
})
export class FormViewComponent implements OnInit {
    @ViewChild("copyFormContent") public copyFormContent: NgbModalModule;
    @ViewChild("publishFormContent") public publishFormContent: NgbModalModule;
    @ViewChild("commentAreaComponent") public commentAreaComponent: DiscussAreaComponent;
    @ViewChild("mltPinModalCde") public mltPinModalCde: PinBoardModalComponent;
    @ViewChild("saveModal") public saveModal: SaveModalComponent;

    elt: any;
    eltCopy = {};
    missingCdes = [];
    modalRef: NgbModalRef;
    hasComments;
    commentMode;
    currentTab = "preview_tab";
    highlightedTabs = [];
    isFormValid = true;
    formInput;
    drafts = [];
    orgNamingTags = [];
    tabsCommented = [];
    formId;
    savingText: string = "";
    draftSubscription: Subscription;

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
            this.loadForm(() => {
                this.orgHelperService.then(() => {
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
            });
        });
    }

    canEdit () {
        return this.isAllowedModel.isAllowed(this.elt) && (this.drafts.length === 0 || this.elt.isDraft);
    }

    formLoaded(cb) {
        if (this.elt) {
            this.formId = this.elt._id;
            this.missingCdes = FormService.areDerivationRulesSatisfied(this.elt);
            this.loadComments(this.elt, null);
        }
        if (cb) cb();
    }

    loadDraft(cb = _.noop) {
        this.http.get("/draftForm/" + this.route.snapshot.queryParams['tinyId'])
            .map(res => res.json()).subscribe(res => {
            if (res && res.length > 0) {
                this.drafts = res;
                this.elt = res[0];
                this.formLoaded(cb);
            } else {
                this.drafts = [];
                this.elt = null;
                cb();
            }
        }, err => {
            this.alert.addAlert("danger", err);
            cb();
        });
    }

    loadForm(cb = _.noop) {
        this.userService.then(() => {
            if (this.userService.user && this.userService.user.username)
                this.loadDraft(() => {
                    if (this.elt)
                        cb();
                    else
                        this.loadPublished(cb);
                });
            else
                this.loadPublished(cb);
        });
    }

    loadPublished(cb = _.noop) {
        let formId = this.route.snapshot.queryParams['formId'];
        let url = "/form/" + this.route.snapshot.queryParams['tinyId'];
        if (formId) url = "/formById/" + formId;
        this.http.get(url).map(res => res.json()).subscribe(res => {
            this.elt = res;
            if (this.elt) this.formLoaded(cb);
            else cb();
        }, () => this.router.navigate(['/pageNotFound'])
        );
    }

    loadComments(form, cb) {
        this.http.get("/comments/eltId/" + form.tinyId)
            .map(res => res.json()).subscribe(res => {
            this.hasComments = res && (res.length > 0);
            this.tabsCommented = res.map(c => c.linkedTab + '_tab');
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

    saveDraft(cb) {
        this.savingText = 'Saving ...';
        this.elt._id = this.formId;
        if (this.draftSubscription) this.draftSubscription.unsubscribe();
        this.draftSubscription = this.http.post("/draftForm/" + this.elt.tinyId, this.elt)
            .map(res => res.json()).subscribe(res => {
            this.elt.isDraft = true;
            if (!this.drafts.length)
                this.drafts = [this.elt];
            this.savingText = "Saved";
            setTimeout(() => {
                this.savingText = "";
            }, 3000);
            this.missingCdes = FormService.areDerivationRulesSatisfied(this.elt);
            this.validateForm();
            if (cb) cb(res);
        }, err => this.alert.addAlert("danger", err));
    }

    saveForm() {
        this.http.put("/form/" + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(
            res => {
                if (res) // TODO: use res instead of loading and block PUT /form/ when drafted?
                    this.loadForm(() => this.alert.addAlert("success", "Form saved."));
            },
            err => this.router.navigate(['/pageNotFound'])
        );
    }

    removeDraft() {
        this.http.delete("/draftForm/" + this.elt.tinyId)
            .subscribe(res => {
                if (res)
                    this.loadForm(() => this.drafts = []);
            }, err => this.alert.addAlert("danger", err));
    }

}
