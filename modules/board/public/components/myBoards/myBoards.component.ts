import { Component, Inject, OnInit } from "@angular/core";
import { MyBoardsService } from "../../myBoards.service";
import { Http } from "@angular/http";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: 'cde-my-boards',
    templateUrl: './myBoards.component.html',
})
export class MyBoardsComponent implements OnInit {

    showChangeStatus: boolean;
    showDelete: boolean;

    constructor(public myBoardsSvc: MyBoardsService,
                @Inject("userResource") public userService,
                private http: Http,
                private alert: AlertService) {}

    ngOnInit() {
        this.myBoardsSvc.loadMyBoards();
    }

    // filter: any =
    //     { tags: [],
    //         shareStatus: [],
    //         type: [],
    //         sortBy: 'createdDate',
    //         sortDirection: 'desc',
    //         selectedShareStatus: [],
    //         selectedTags: [],
    //         suggestTags: []
    //     };
    //
    // getSuggestedTags (filter, search) {
    //     let newSuggestTags = filter.suggestTags.slice();
    //     if (search && newSuggestTags.indexOf(search) === -1) {
    //         newSuggestTags.unshift(search);
    //     }
    //     return newSuggestTags;
    // }


    // loadMyBoards (cb) {
        // ElasticBoard.loadMyBoards($scope.filter, function (response) {
        //     if (response.hits) {
        //         $scope.boards = response.hits.hits.map(function (h) {
        //             h._source._id = h._id;
        //             return h._source;
        //         });
        //         $scope.filter.tags = response.aggregations.tagAgg.buckets;
        //         $scope.filter.types = response.aggregations.typeAgg.buckets;
        //         $scope.filter.shareStatus = response.aggregations.ssAgg.buckets;
        //         $scope.filter.suggestTags = response.aggregations.tagAgg.buckets.map(function (t) {
        //             return t.key;
        //         });
        //         if (cb) cb();
        //     }
        // });
    // }
//
// var waitAndReload = function(message) {
//     if (!message) message = "Done";
//     $scope.reloading = true;
//     $timeout(function () {
//         $scope.loadMyBoards(function () {
//             $scope.reloading = false;
//             Alert.addAlert("success", message);
//         });
//     }, 2000);
// };
//

//     canEditBoard () {
//         return true;
//     }

    removeBoard (index) {
        this.showDelete = false;
        this.http.delete("/board/" + this.myBoardsSvc.boards[index]._id).subscribe( () => this.myBoardsSvc.waitAndReload());
    };

    cancelSave (board) {
        delete board.editMode;
        board.showEdit = false;
    };

    changeStatus (index) {
        let board = this.myBoardsSvc[index];
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
            }, (response) => this.alert.addAlert("danger", response.data)
        );
    }

}