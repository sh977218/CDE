import { Component, Input, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-create-form-from-board",
    templateUrl: "./createFormFromBoard.component.html"
})
export class CreateFormFromBoardComponent {
    @ViewChild("createFormContent") public createFormContent: NgbModalModule;
    public modalRef: NgbModalRef;

    @Input() board: any;
    elt;

    constructor(private http: Http,
                public modalService: NgbModal,
                private alert: AlertService) {
    }

    openCreateFormModal() {
        this.elt = {
            naming: [
                {designation: this.board.name}],
            elementType: "form",
            stewardOrg: {},
            classification: [],
            formElements: [],
            registrationState: {registrationStatus: "Incomplete"}
        };
        if (this.board.pins && this.board.pins.length > 0) {
            this.elt.formElements.push({
                elementType: 'section',
                label: "",
                formElements: []
            });
            this.http.get('/board/' + this.board._id + "/0/500")
                .map(res => res.json()).subscribe(
                res => {
                    res.elts.forEach(p => {
                        this.elt.formElements[0].formElements.push({
                            elementType: 'question',
                            label: p.naming[0].designation,
                            formElements: [],
                            question: {
                                cde: {
                                    tinyId: p.tinyId,
                                    name: p.naming[0].designation,
                                    version: p.version ? p.version : null,
                                    permissibleValues: p.valueDomain.permissibleValues,
                                    ids: p.ids
                                }
                            }
                        });
                    });
                    this.modalRef = this.modalService.open(this.createFormContent, {size: "lg"});
                }, err => this.alert.addAlert("danger", "Error on load elements in board " + err)
            );
        }
    }

}
