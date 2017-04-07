import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import { Component, Inject, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { MyBoardsService } from "../../myBoards.service";

@Component({
    selector: "cde-create-board",
    templateUrl: "./createBoard.component.html",
    providers: [NgbActiveModal]
})

export class CreateBoardComponent {

    constructor(
        private http: Http,
        public modalService: NgbModal,
        @Inject("Alert") private alert,
        private myBoardsSvc: MyBoardsService,
) {}

    newBoard: any = {
        type: 'cde'
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
        }, () => {
            this.alert.addAlert("danger", "There was an issue creating this board.");
        });
    }

}