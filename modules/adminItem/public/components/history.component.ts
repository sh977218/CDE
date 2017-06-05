import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Http } from '@angular/http';

import "rxjs/add/operator/map";
import { CompareObjectComponent } from "../../../compare/compareObject.component";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-admin-item-history",
    templateUrl: "./history.component.html",
    styles: [`
        caption {
            caption-side: top;
        }`],
    providers: [NgbActiveModal]
})
export class HistoryComponent implements OnInit {
    @ViewChild("compareContent") public compareContent: NgbModal;
    @Input() public elt: any;
    public modalRef: NgbActiveModal;
    showVersioned: boolean = false;
    public priorElements = [];
    public numberSelected: number = 0;

    constructor(@Inject("Alert")
                private alert,
                private http: Http,
                public modalService: NgbModal,
                @Inject("isAllowedModel")
                public isAllowedModel) {
    }

    ngOnInit(): void {
        delete this.elt.selected;
        if (this.elt.history && this.elt.history.length > 0) {
            this.http.get('/priorElements/' + this.elt.elementType + '/' + this.elt._id).map(res => res.json())
                .subscribe(res => {
                    this.priorElements = res.reverse();
                    this.elt.viewing = true;
                    this.priorElements.splice(0, 0, this.elt);
                }, err =>
                    this.alert.addAlert("danger", "Error retrieving history: " + err));
        }

    }

    selectRow(priorCde) {
        if (this.numberSelected === 2 && !priorCde.selected) {
            priorCde.selected = false;
        } else if (this.numberSelected === 2 && priorCde.selected) {
            priorCde.selected = false;
            this.numberSelected--;
        } else {
            priorCde.selected = !priorCde.selected;
            if (priorCde.selected) this.numberSelected++;
            else this.numberSelected--;
        }
    }

    openCompareSideBySideModal() {
        this.modalRef = this.modalService.open(this.compareContent, {size: "lg"});
    }

    getSelectedElt() {
        return this.priorElements.filter(p => p.selected);
    }

}
