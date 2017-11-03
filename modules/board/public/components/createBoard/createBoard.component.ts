import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Component, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { AlertService } from '_app/alert/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';

@Component({
    selector: "cde-create-board",
    templateUrl: "./createBoard.component.html",
    providers: [NgbActiveModal]
})

export class CreateBoardComponent {

    constructor(
        private http: Http,
        public modalService: NgbModal,
        private alert: AlertService,
        private myBoardsSvc: MyBoardsService,
    ) {}

    newBoard: any = {
        type: "cde"
    };

    @ViewChild("createBoardModal") public createBoardModal: NgbModalModule;
    public modalRef: NgbModalRef;

    openNewBoard () {
        this.modalRef = this.modalService.open(this.createBoardModal, {size: "lg"});
    };

    doCreateBoard () {
        this.newBoard.shareStatus = "Private";
        this.http.post("/board", this.newBoard).subscribe(() => {
            this.myBoardsSvc.waitAndReload();
            this.modalRef.close();
            this.alert.addAlert("success", "Board created.");
        }, (r) => {
            this.alert.addAlert("danger", r.text());
        });
    }

}