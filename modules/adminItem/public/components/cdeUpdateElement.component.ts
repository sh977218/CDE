import { Component, Input, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-update-element",
    templateUrl: "./cdeUpdateElement.component.html"
})


export class CdeUpdateElementComponent {
    @ViewChild("updateElementContent") public updateElementContent: NgbModalModule;
    @Input() elt: any;
    public modalRef: NgbModalRef;
    pattern = /^[A-z0-9-=.]+$/;

    constructor(public modalService: NgbModal, public http: Http) {
    }

    openSaveModal() {
        this.modalRef = this.modalService.open(this.updateElementContent, {size: "lg"});
    }

    discardChange() {
        this.http.get("/deviewByTinyId")
    }

    verifyVersionUnicity() {
        let lastVersion = this.elt.version;
        let url;
        if (this.elt.elementType === "form") {
            url = '/formByTinyIdAndVersion/' + this.elt.tinyId + "/" + this.elt.version;
        } else {
            url = '/deExists/' + this.elt.tinyId + "/" + this.elt.version
        }
        this.http.get(url).map(res => res.json()).subscribe(
            res => {
                if (lastVersion !== this.elt.version) return;
                //this.saveForm.version.$setValidity('unique', !response.data);
            },
            err => {
                if (lastVersion !== this.elt.version) return;
                //this.saveForm.version.$setValidity('unique', false);
            })
    }


}