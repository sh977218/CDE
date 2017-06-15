import { Component, Input, ViewChild } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { Http } from "@angular/http";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-linked-boards",
    providers: [NgbActiveModal],
    templateUrl: "linkedBoards.component.html"
})

export class LinkedBoardsComponent {

    @ViewChild("linkedBoardsContent") public linkedBoardsContent: NgbModalModule;
    @Input() public elt: any;
    public modalRef: NgbModalRef;
    boards: any[];

    constructor(private http: Http,
                private alert: AlertService,
                public modalService: NgbModal) {
    };

    openLinkedBoardsModal() {
        this.http.get("/deBoards/" + this.elt.tinyId).map(r => r.json()).subscribe(response => {
            if (response.error) {
                this.boards = [];
                this.alert.addAlert("danger", "Error retrieving boards.");
            } else {
                this.boards = response;
                this.modalRef = this.modalService.open(this.linkedBoardsContent, {size: "lg"});
            }
        });
    }

}