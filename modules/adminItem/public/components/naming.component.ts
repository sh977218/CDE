import { Component, Inject, Input, ViewChild, OnInit, EventEmitter, Output } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { OrgHelperService } from "../../../core/public/orgHelper.service";
import { AlertService } from "../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-naming",
    templateUrl: "./naming.component.html"
})
export class NamingComponent implements OnInit {

    @ViewChild("newNamingContent") public newNamingContent: NgbModalModule;
    @Input() public elt: any;
    @Output() onEltChange = new EventEmitter();
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
        this.getCurrentTags();
        this.elt.naming.forEach(n => {
            n.currentTags.forEach(ct => {
                if (!this.orgNamingTags.find((elt) => ct === elt.text)) {
                    this.orgNamingTags.push({"id": ct, "text": ct});
                }
            });
        });
        this.orgHelperService.then(() => {
            this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name].nameTags.forEach(nt => {
                if (!this.orgNamingTags.find((elt) => nt === elt.text)) {
                    this.orgNamingTags.push({"id": nt, "text": nt});
                }
                this.onInitDone = true;
            });
            this.loaded = true;
        });
        this.isAllowed = this.isAllowedModel.isAllowed(this.elt);
    }

    getCurrentTags() {
        this.elt.naming.forEach(n => {
            if (!n.tags) n.tags = [];
            n.currentTags = n.tags.map(t => t.tag);
        });
    }

    openNewNamingModal() {
        this.modalRef = this.modalService.open(this.newNamingContent, {size: "lg"});
        this.modalRef.result.then(() => this.newNaming = {}, () => {
        });
    }

    addNewNaming() {
        this.elt.naming.push(this.newNaming);
        this.modalRef.close();
        this.onEltChange.emit();
        this.getCurrentTags();
    }

    removeNamingByIndex(index) {
        this.elt.naming.splice(index, 1);
        this.onEltChange.emit();
    }

    changedTags(name, data: { value: string[] }, needToSave = true) {
        if (!data.value) data.value = [];
        name.tags = data.value.map(d => {
            return {tag: d};
        });
        // @TODO remove after convert newTags
        name.newTags = data.value.map(d => {
            return d;
        });
        if (needToSave)
            this.onEltChange.emit();
    }

}
