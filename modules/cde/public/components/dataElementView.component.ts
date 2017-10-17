import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule, NgbTabset } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { UserService } from 'core/public/user.service';
import * as authShared from "system/shared/authorizationShared";
import { IsAllowedService } from 'core/public/isAllowed.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as deValidator from "../../shared/deValidator.js";
import { AlertService } from '_app/alert/alert.service';
import { OrgHelperService } from 'core/public/orgHelper.service';

@Component({
    selector: "cde-data-element-view",
    templateUrl: "dataElementView.component.html",
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
export class DataElementViewComponent implements OnInit {
    @ViewChild("copyDataElementContent") public copyDataElementContent: NgbModalModule;
    @ViewChild("commentAreaComponent") public commentAreaComponent: DiscussAreaComponent;
    @ViewChild("tabSet") public tabSet: NgbTabset;
    @Output() public h = new EventEmitter();

    elt: any;
    public eltCopy = {};
    public modalRef: NgbModalRef;
    displayStatusWarning;
    hasComments;
    commentMode;
    currentTab = "general_tab";
    highlightedTabs = [];
    canEdit: boolean = false;
    drafts = [];
    deId;
    mobileView: boolean = false;
    orgNamingTags = [];
    tabsCommented = [];

    constructor(private http: Http,
                private route: ActivatedRoute,
                private router: Router,
                private ref: ChangeDetectorRef,
                public modalService: NgbModal,
                public isAllowedModel: IsAllowedService,
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private alert: AlertService,
                public userService: UserService) {
    }

    ngOnInit() {
        this.route.queryParams.subscribe(() => {
            this.loadDataElement(de => {
                this.userService.then(() => {
                    this.orgHelperService.then(() => {
                        let user = this.userService.user;
                        if (user && user.username) {
                            this.loadComments(de, null);
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

    loadDataElement(cb) {
        let cdeId = this.route.snapshot.queryParams['cdeId'];
        let url = "/de/" + this.route.snapshot.queryParams['tinyId'];
        if (cdeId) url = "/deById/" + cdeId;
        this.http.get(url).map(res => res.json()).subscribe(res => {
                this.elt = res;
                this.deId = this.elt._id;
                this.userService.then(() => {
                    let user = this.userService.user;
                    if (user && user.username)
                        deValidator.checkPvUnicity(this.elt.valueDomain);
                    this.setDisplayStatusWarning();
                    this.canEdit = this.isAllowedModel.isAllowed(this.elt);
                    if (cb) cb(this.elt);
                });
            }, () => this.router.navigate(['/pageNotFound'])
        );
    }

    loadComments(de, cb) {
        this.http.get("/comments/eltId/" + de.tinyId)
            .map(res => res.json()).subscribe(res => {
            this.hasComments = res && (res.length > 0);
            this.tabsCommented = res.map(c => c.linkedTab + '_tab');
            if (cb) cb();
        }, err => this.alert.addAlert("danger", "Error loading comments. " + err));
    }

    setDisplayStatusWarning() {
        let assignValue = () => {
            if (!this.elt) return false;
            if (this.elt.archived || this.userService.user.siteAdmin) {
                return false;
            } else {
                if (this.userService.userOrgs) {
                    return authShared.isCuratorOf(this.userService.user, this.elt.stewardOrg.name) &&
                        (this.elt.registrationState.registrationStatus === "Standard" ||
                            this.elt.registrationState.registrationStatus === "Preferred Standard");
                } else {
                    return false;
                }
            }
        };
        this.userService.then(() => {
            this.displayStatusWarning = assignValue();
        });
    };

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
        this.modalRef = this.modalService.open(this.copyDataElementContent, {size: "lg"});
    }

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    setCurrentTab(currentTab) {
        this.currentTab = currentTab;
        if (this.commentMode) this.commentAreaComponent.setCurrentTab(this.currentTab);
    }

    doStageElt() {
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Save to confirm.");
        } else {
            this.saveDataElement();
        }
    }

    removeAttachment(index) {
        this.http.post("/attachments/cde/remove", {
            index: index,
            id: this.elt._id
        }).map(r => r.json()).subscribe(res => {
            this.elt = res;
            this.alert.addAlert("success", "Attachment Removed.");
            this.ref.detectChanges();
        });
    }

    setDefault(index) {
        this.http.post("/attachments/cde/setDefault",
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
            this.http.post("/attachments/cde/add", formData).map(r => r.json()).subscribe(
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
        this.http.get("/draftDataElement/" + this.elt.tinyId)
            .map(res => res.json()).subscribe(
            res => {
                if (cb) cb(res[0]);
            },
            err => this.alert.addAlert("danger", err));
    }

    saveDraft(cb) {
        this.elt._id = this.deId;
        this.http.post("/draftDataElement/" + this.elt.tinyId, this.elt)
            .map(res => res.json()).subscribe(res => {
            this.elt.isDraft = true;
            if (cb) cb(res);
        }, err => this.alert.addAlert("danger", err));
    }

    saveDataElement() {
        this.http.put("/de/" + this.elt.tinyId, this.elt)
            .map(res => res.json()).subscribe(res => {
            if (res) {
                this.loadDataElement(() => this.alert.addAlert("success", "Data Element saved."));
                this.loadDraft(null);
            }
        }, err => this.alert.addAlert("danger", "Sorry, we are unable to retrieve this data element."));
    }

    removeDraft() {
        this.http.delete("/draftDataElement/" + this.elt.tinyId)
            .subscribe(res => {
                this.drafts = [];
                if (res) this.loadDataElement(null);
            }, err => this.alert.addAlert("danger", err));
    }


}
