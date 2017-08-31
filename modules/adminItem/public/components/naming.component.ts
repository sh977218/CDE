import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as _ from 'lodash';
import { OrgHelperService } from "../../../core/public/orgHelper.service";
import { AlertService } from "../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-admin-item-naming",
    templateUrl: "./naming.component.html"
})
export class NamingComponent implements OnInit {

    @ViewChild("newNamingContent") public newNamingContent: NgbModalModule;
    @Input() public elt: any;
    public newNaming: any = {};
    public modalRef: NgbModalRef;
    public orgNamingTags: { id: string; text: string }[] = [];

    loaded: boolean;
    public onInitDone: boolean;

    //noinspection TypeScriptUnresolvedVariable
    public options: Select2Options = {
        multiple: true,
        tags: true,
        language: {
            noResults: () => {
                return "No Tags found, Tags are managed in Org Management > List Management";
            }
        }
    };

    public isAllowed: boolean = false;

    constructor(private alert: AlertService,
                @Inject("isAllowedModel") public isAllowedModel,
                private orgHelperService: OrgHelperService,
                public modalService: NgbModal) {
    }

    ngOnInit(): void {
        this.orgHelperService.then(() => {
            this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name].nameTags.forEach(nt => {
                if (!this.orgNamingTags.find((elt) => nt === elt.text)) {
                    this.orgNamingTags.push({"id": nt, "text": nt});
                }
                this.elt.naming.forEach(n => {
                    n.tags.forEach(t => {
                        this.orgNamingTags.push({"id": t, "text": t});
                    });
                });
                this.orgNamingTags = _.uniqWith(this.orgNamingTags, _.isEqual);
                this.onInitDone = true;
            });
            this.loaded = true;
        });
        this.isAllowed = this.isAllowedModel.isAllowed(this.elt);
    }

    openNewNamingModal() {
        this.modalRef = this.modalService.open(this.newNamingContent, {size: "lg"});
        this.modalRef.result.then(() => this.newNaming = {}, () => {
        });
    }

    addNewNaming() {
        this.elt.naming.push(this.newNaming);
        this.modalRef.close();
        this.elt.unsaved = true;
    }

    removeNamingByIndex(index) {
        this.elt.naming.splice(index, 1);
        this.elt.unsaved = true;
    }

    changedTags(name, data: { value: string[] }, needToSave = true) {
        name.tags = data.value;
        if (needToSave)
            this.elt.unsaved = true;
    }

}
