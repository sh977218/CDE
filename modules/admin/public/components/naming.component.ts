import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { Select2OptionData } from "ng2-select2";

@Component({
    selector: "cde-admin-item-naming",
    providers: [NgbActiveModal],
    templateUrl: "./naming.component.html"
})
export class NamingComponent implements OnInit {
    ngOnInit(): void {
        this.orgNamingTags = this.orgHelpers.orgsDetailedInfo[this.elt.stewardOrg.name].nameTags.map(r => {
            return {"id": r, "text": r};
        });
        this.options = {
            multiple: true,
            tags: true,
            language: {
                noResults: () => {
                    return "No Tags found, Tags are managed in Org Management > List Management";
                }
            }
        };
        this.getCurrentTags();
    }

    getCurrentTags() {
        this.elt.naming.forEach(n => {
            if (!n.tags) n.tags = [];
            n.currentTags = n.tags.map(t => {
                return t.tag;
            });
        });
    }

    @ViewChild("newNamingContent") public newNamingContent: NgbModalModule;
    @Input() public elt: any;
    public newNaming: any = {};
    public modalRef: NgbModalRef;
    orgNamingTags: string[] = [];
    //noinspection TypeScriptUnresolvedVariable
    public options: Select2Options;

    constructor(@Inject("Alert") private alert,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("OrgHelpers") private orgHelpers,
                public modalService: NgbModal,
                public activeModal: NgbActiveModal) {
    }

    openNewNamingModal() {
        this.modalRef = this.modalService.open(this.newNamingContent, {size: "lg"});
        this.modalRef.result.then(result => {
            this.newNaming = {};
        });
    }

    addNewNaming() {
        this.elt.naming.push(this.newNaming);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Naming added. Save to confirm.");
            this.modalRef.close();
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.getCurrentTags();
                this.alert.addAlert("success", "Naming Added");
                this.modalRef.close();
            });
        }
    }

    removeNamingByIndex(index) {
        this.elt.properties.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Naming removed. Save to confirm.");
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.getCurrentTags();
                this.alert.addAlert("success", "Naming Removed");
            });
        }
    }

    changedTags(name, data: {value: string[]}) {
        if (!data.value) data.value = [];
        name.tags = data.value.map(d => {
            return {tag: d};
        });
        this.elt.unsaved = true;
    }

    saveNaming() {
        this.elt.$save(newElt => {
            this.elt = newElt;
            this.getCurrentTags();
            this.alert.addAlert("success", "Saved");
        });
    };

}
