import { Component, OnInit } from "@angular/core";
import { MyBoardsService } from "../../myBoards.service";
import { Http } from "@angular/http";
import { AlertService } from "../../../../system/public/components/alert/alert.service";
import { UserService } from "../../../../core/public/user.service";

@Component({
    selector: 'cde-my-boards',
    templateUrl: './myBoards.component.html',
})
export class MyBoardsComponent implements OnInit {

    showChangeStatus: boolean;
    showDelete: boolean;
    suggestTags = [];

    constructor(public myBoardsSvc: MyBoardsService,
                public userService: UserService,
                private http: Http,
                private alert: AlertService) {}

    ngOnInit() {
        this.myBoardsSvc.loadMyBoards();
    }

    selectAggregation (aggName, $index) {
        this.myBoardsSvc.filter[aggName][$index].checked = !this.myBoardsSvc.filter[aggName][$index].checked;
        this.myBoardsSvc.loadMyBoards();
    }

    getLinkSource(id) {
        return '/board/' + id;
    }

    removeBoard (index) {
        this.showDelete = false;
        this.http.delete("/board/" + this.myBoardsSvc.boards[index]._id).subscribe(() => {
            this.alert.addAlert("success", "Done");
            this.myBoardsSvc.waitAndReload();
        });
    };

    cancelSave (board) {
        delete board.editMode;
        board.showEdit = false;
    };

    changeStatus (index) {
        let board = this.myBoardsSvc.boards[index];
        if (board.shareStatus === "Private") {
            board.shareStatus = "Public";
        } else {
            board.shareStatus = "Private";
        }
        this.save(board);
        this.showChangeStatus = false;
    };

    save (board) {
        delete board.editMode;
        this.http.post("/board", board).map(r => r.text()).subscribe(() => {
            this.alert.addAlert("success", "Saved.");
            this.myBoardsSvc.waitAndReload();
            }, err => {
                console.log(err);
                this.alert.addAlert("danger", err._body);
            }
        );
    }

}