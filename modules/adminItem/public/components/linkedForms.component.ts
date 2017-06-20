import { Component, Inject, Input, ViewChild } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-linked-forms",
    providers: [NgbActiveModal],
    templateUrl: "linkedForms.component.html"
})

export class LinkedFormsComponent {

    @ViewChild("linkedFormsContent") public linkedFormsContent: NgbModalModule;
    @Input() public elt: any;
    public modalRef: NgbModalRef;

    forms: [any];

    constructor(@Inject("Elastic") private elastic,
                public modalService: NgbModal,
                ) {
    };

    openLinkedFormsModal() {
        let searchSettings = this.elastic.defaultSearchSettings;
        searchSettings.q = `"` + this.elt.tinyId + `"`;
        this.elastic.generalSearchQuery(this.elastic.buildElasticQuerySettings(searchSettings), "form", (err, result) => {
            if (err) return;
            this.forms = result.forms.filter(f => {
                 return f.tinyId !== this.elt.tinyId;
            });
            this.modalRef = this.modalService.open(this.linkedFormsContent, {size: "lg"});
        });
    }

    getFormText () {
        if (!this.forms || this.forms.length === 0) {
            return "There are no forms that use this " + this.elt.elementType;
        }
        else if (this.forms.length === 1) {
            return "There is 1 form that uses this " + this.elt.elementType;
        }
        else if (this.forms.length >= 20) {
            return "There are more than 20 forms that use this " + this.elt.elementType;
        }
        else {
            return "There are " + this.forms.length + " forms that use this " + this.elt.elementType;
        }
    }

}