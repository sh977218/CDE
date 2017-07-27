import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Http } from '@angular/http';

import "rxjs/add/operator/map";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";

const URL_MAP = {
    "cde": "/deView?cdeId=",
    "form": "/formView?formId="
};

@Component({
    selector: "cde-admin-item-history",
    templateUrl: "./history.component.html",
    styles: [`
        caption {
            caption-side: top;
        }

        .input-color input {
            padding-left: 20px;
        }

        .input-color .color-box {
            width: 10px;
            height: 10px;
            display: inline-block;
            left: 5px;
            top: 5px;
        }

        .isSelected {
            background-color: #f5f5f5;
        }

    `],
    providers: [NgbActiveModal]
})
export class HistoryComponent implements OnInit {
    @ViewChild("compareContent") public compareContent: NgbModal;
    @Input() public elt: any;
    public modalRef: NgbActiveModal;
    showVersioned: boolean = false;
    public priorElements = [];
    public numberSelected: number = 0;
    public filter = {
        reorder: {
            select: true
        },
        add: {
            select: true
        },
        remove: {
            select: true
        },
        edited: {
            select: true
        }
    };

    constructor(private alert: AlertService,
                private http: Http,
                public modalService: NgbModal,
                @Inject("isAllowedModel")
                public isAllowedModel) {
    }

    ngOnInit(): void {
        let prefix_url = URL_MAP[this.elt.elementType];
        delete this.elt.selected;
        if (this.elt.history && this.elt.history.length > 0) {
            let url;
            if (this.elt.elementType === "cde") {
                url = "/deById/" + this.elt._id + "/priorDataElements";
            } else {
                url = "/formById/" + this.elt._id + "/priorForms";
            }
            this.http.get(url).map(res => res.json()).subscribe(res => {
                this.priorElements = res.reverse();
                this.elt.viewing = true;
                this.priorElements.splice(0, 0, this.elt);
                this.priorElements.forEach(pe => {
                    pe.url = prefix_url + pe._id;
                });
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
