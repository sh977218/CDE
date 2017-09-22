import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { AlertService } from 'system/public/components/alert/alert.service';
import { UserService } from 'core/public/user.service';
import * as authShared from "system/shared/authorizationShared";
import { IsAllowedService } from 'core/public/isAllowed.service';

@Component({
    selector: "cde-data-element-view",
    templateUrl: "dataElementView.component.html"
})
export class DataElementViewComponent implements OnInit {
    @ViewChild("copyDataElementContent") public copyDataElementContent: NgbModalModule;
    @ViewChild("commentAreaComponent") public commentAreaComponent: DiscussAreaComponent;
    @Input() routeParams: any;
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

    constructor(private http: Http,
                private ref: ChangeDetectorRef,
                public modalService: NgbModal,
                public isAllowedModel: IsAllowedService,
                public quickBoardService: QuickBoardListService,
                private alert: AlertService,
                public userService: UserService) {
    }

    ngOnInit(): void {
        let cdeId = this.routeParams.cdeId;
        let url = "/de/" + this.routeParams.tinyId;
        if (cdeId) url = "/deById/" + cdeId;
        this.http.get(url).map(r => r.json()).subscribe(response => {
                this.elt = response;
                this.h.emit({elt: this.elt, fn: this.onLocationChange});
                this.http.get("/comments/eltId/" + this.elt.tinyId)
                    .map(res => res.json()).subscribe(
                    res => this.hasComments = res && (res.length > 0),
                    err => this.alert.addAlert("danger", "Error on loading comments. " + err)
                );
                this.userService.then(() => {
                    this.setDisplayStatusWarning();
                    this.canEdit = this.isAllowedModel.isAllowed(this.elt);
                });
            }, () => this.alert.addAlert("danger", "Sorry, we are unable to retrieve this data element.")
        );
    }

    onLocationChange(event, oldUrl, elt) {
        if (elt && elt.unsaved && oldUrl.indexOf("deView") > -1) {
            let txt = "You have unsaved changes, are you sure you want to leave this page? ";
            if ((window as any).debugEnabled) {
                txt = txt + window.location.pathname;
            }
            let answer = confirm(txt);
            if (!answer) {
                event.preventDefault();
            }
        }
    }

    reloadDataElement() {
        this.http.get("/de/" + this.elt.tinyId).map(r => r.json()).subscribe(response => {
                this.elt = response;
                this.h.emit({elt: this.elt, fn: this.onLocationChange});
                this.alert.addAlert("success", "Changes discarded.");
            }, () => this.alert.addAlert("danger", "Sorry, we are unable to retrieve this data element.")
        );
    }

    setDisplayStatusWarning () {
        let assignValue  = () => {
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

    saveDataElement() {
        this.http.put("/de/" + this.elt.tinyId, this.elt).map(r => r.json()).subscribe(response => {
                this.elt = response;
                this.h.emit({elt: this.elt, fn: this.onLocationChange});
                this.alert.addAlert("success", "Data Element saved.");
            }, () => this.alert.addAlert("danger", "Sorry, we are unable to retrieve this data element.")
        );
        this.setDisplayStatusWarning();
        this.canEdit = this.isAllowedModel.isAllowed(this.elt);
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
        this.modalRef = this.modalService.open(this.copyDataElementContent, {size: "lg"});
    }

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    beforeChange(event) {
        this.currentTab = event.nextId;
        if (this.commentMode)
            this.commentAreaComponent.setCurrentTab(this.currentTab);
    }

    doStageElt() {
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Save to confirm.");
        } else {
            this.saveDataElement();
            this.modalRef.close();
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
}
