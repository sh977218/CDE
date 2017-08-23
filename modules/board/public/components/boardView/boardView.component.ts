import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { AlertService } from "../../../../system/public/components/alert/alert.service";
import {NgbModal, NgbModalModule, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import { SharedService } from "../../../../core/public/shared.service";
import { saveAs } from "cde/public/assets/js/FileSaver";
import {ClassifyItemModalComponent} from "../../../../adminItem/public/components/classification/classifyItemModal.component";

@Component({
    selector: 'cde-board-view',
    templateUrl: './boardView.component.html',
})
export class BoardViewComponent implements OnInit {

    @Input() boardId: string;
    // @Input() canEditBoard: boolean;
    //
    // @Output() save = new EventEmitter();

    @ViewChild("shareBoardModal") public shareBoardModal: NgbModalModule;
    @ViewChild("classifyCdesModal") public classifyCdesModal: ClassifyItemModalComponent;

    currentPage: number = 1;
    totalItems: number;
    board: any;
    isModifiedSinceReview: boolean;
    reviewers: any[];
    canReview: boolean;
    listViews: {};
    elts: any[] = [];
    commentMode: boolean;
    boardStatus: any;
    feedbackClass: string[] = [""];
    users: any[] = [];
    modalTitle: string;

    shareModalRef: NgbModalRef;

    constructor(private http: Http,
                private alert: AlertService,
                @Inject('userResource') protected userService,
                private modalService: NgbModal,
                @Inject('SearchSettings') public searchSettings
                ) {}

    ngOnInit () {
        this.reload();
    }

    reload () {
        this.http.get("/board/" + this.boardId + "/" + ((this.currentPage - 1) * 20)).map(r => r.json()).subscribe(response => {
            if (response.board) {
                this.board = response.board;
                this.modalTitle = 'Classify ' + (this.board.type === 'form' ? 'Form' : 'CDE') + 's in this Board';
                // if (this.board.type === "form")
                //     $scope.quickBoard = $scope.formQuickBoard;
                // $scope.elts = $scope[$scope.board.type + 's'] = [];

                // $scope.module = $scope.board.type;
                this.totalItems = response.totalItems;
                // $scope.numPages = $scope.totalItems / 20;
                let pins = this.board.pins;
                let respElts = response.elts;
                pins.forEach(pin => {
                    let pinId = this.board.type === 'cde' ? pin.deTinyId : pin.formTinyId;
                    respElts.forEach(elt => {
                        if (pinId === elt.tinyId) {
                            pins.elt = elt;
                            this.elts.push(elt);
                        }
                    });
                });

                this.userService.getPromise().then(() => {
                    this.board.users.forEach(u => {
                        if (u.username === this.userService.user.username &&
                            u.role === 'reviewer' && u.status.approval === 'approved' &&
                            new Date(this.board.updatedDate) >= new Date(u.status.reviewedDate)) {
                            this.isModifiedSinceReview = true;
                        }
                    });
                    this.canReview = this.isReviewActive() &&
                            this.board.users.filter(
                                u => u.role === 'reviewer' && u.username.toLowerCase() === this.userService.user.username.toLowerCase()
                            ).length > 0;
                });

                this.getReviewers();

                // $scope.elts.forEach(function (elt) {
                //     elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);
                // });
                // $scope.board.users.filter(function (u) {
                //     if (u.lastViewed) u.lastViewedLocal = new Date(u.lastViewed).toLocaleDateString();
                //     if (u.username === userResource.user.username) {
                //         $scope.boardStatus = u.status.approval;
                //     }
                // });
                // $scope.deferredEltLoaded.resolve();
            }
        }, () => {
            this.alert.addAlert("danger", "Board not found");
        });
    };

    // $scope.setPage = function (p) {
    //     $scope.currentPage = p;
    //     $scope.reload();
    // };
    //

    // $scope.getEltId = function () {
    //     return $scope.board._id;
    // };
    // $scope.getEltName = function () {
    //     return $scope.board.name;
    // };
    // $scope.getCtrlType = function () {
    //     return "board";
    // };
    // $scope.doesUserOwnElt = function () {
    //     return userResource.user.siteAdmin || (userResource.user.username === $scope.board.owner.username);
    // };
    //
    // $scope.deferredEltLoaded = $q.defer();
    //
    //
    // $scope.unpin = function (pin) {
    //     var url;
    //     if (pin.deTinyId) {
    //         url = "/pin/cde/" + pin.deTinyId + "/" + $scope.board._id;
    //     } else if (pin.formTinyId) {
    //         url = "/pin/form/" + pin.formTinyId + "/" + $scope.board._id;
    //     }
    //     $http['delete'](url).then(function onSuccess() {
    //         $scope.reload();
    //         Alert.addAlert("success", "Unpinned.");
    //     }).catch(function onError() {
    //     });
    // };
    //
    exportBoard () {
        this.http.get('/board/' + this.board._id + '/0/500/?type=csv')
            .map(r => r.json()).subscribe(response => {
                this.searchSettings.getPromise().then(settings => {
                    let csv = SharedService.exportShared.getCdeCsvHeader(settings.tableViewFields);
                    response.elts.forEach(ele => {
                        csv += SharedService.exportShared.convertToCsv(
                            SharedService.exportShared.projectCdeForExport(ele, settings.tableViewFields));
                    });
                    if (csv) {
                        let blob = new Blob([csv], {
                            type: "text/csv"
                        });
                        saveAs(blob, 'BoardExport' + '.csv');  // jshint ignore:line
                        this.alert.addAlert("success", "Export downloaded.");
                        this.feedbackClass = ["fa-download"];
                    } else {
                        this.alert.addAlert("danger", "The server is busy processing similar request, please try again in a minute.");
                    }
                });
            });
    };
    //
    // function movePin(endPoint, pinId) {
    //     $http.post(endPoint, {boardId: $scope.board._id, tinyId: pinId}).then(function onSuccess() {
    //         Alert.addAlert("success", "Saved");
    //         $scope.reload();
    //     }).catch(function onError(response) {
    //         Alert.addAlert("danger", response.data);
    //         $scope.reload();
    //     });
    // }
    //
    // $scope.moveUp = function (id) {
    //     movePin("/board/pin/move/up", id);
    // };
    // $scope.moveDown = function (id) {
    //     movePin("/board/pin/move/down", id);
    // };
    // $scope.moveTop = function (id) {
    //     movePin("/board/pin/move/top", id);
    // };
    //
    // $scope.save = function () {
    //     $http.post("/board", $scope.board).then(function onSuccess() {
    //         Alert.addAlert("success", "Saved");
    //         $scope.reload();
    //     }).catch(function onError(response) {
    //         Alert.addAlert("danger", response.data);
    //         $scope.reload();
    //     });
    // };


    addClassification (event) {
        let _timeout = setInterval(() => this.alert.addAlert("warning", "Classification task is still in progress. Please hold on."), 3000);
        this.http.post(this.board.type === 'form' ? '/classifyFormBoard' : '/classifyCdeBoard',
            {
                boardId: this.board._id,
                newClassification: {
                    categories: event.classificationArray,
                    orgName: event.selectedOrg
                }
            }
        ).subscribe(() => {
            clearInterval(_timeout);
            this.alert.addAlert("success", "All Elements classified.");
        }, () => {
            this.alert.addAlert("danger", "Unexpected error. Not Elements were classified! You may try again.");
            clearInterval(_timeout);
        });
    }

    classifyEltBoard () {
        this.classifyCdesModal.openModal();

        // var $modalInstance = $modal.open({
        //     animation: false,
        //     templateUrl: '/system/public/html/classifyCdesInBoard.html',
        //     controller: 'AddClassificationModalCtrl',
        //     resolve: {
        //         module: function () {
        //             return $scope.board.type;
        //         },
        //         addClassification: function () {
        //             return {
        //                 addClassification: function (newClassification) {
        //                     var _timeout = $timeout(function () {
        //                         Alert.addAlert("warning", "Classification task is still in progress. Please hold on.");
        //                     }, 3000);
        //                     $http({
        //                         method: 'post',
        //                         url: $scope.board.type === 'form' ? '/classifyFormBoard' : '/classifyCdeBoard',
        //                         data: {
        //                             boardId: $scope.board._id,
        //                             newClassification: newClassification
        //                         }
        //                     }).then(function onSuccess(response) {
        //                         $timeout.cancel(_timeout);
        //                         if (response.status === 200) Alert.addAlert("success", "All Elements classified.");
        //                         else Alert.addAlert("danger", response.data.error.message);
        //                     }).catch(function onError() {
        //                         Alert.addAlert("danger", "Unexpected error. Not Elements were classified! You may try again.");
        //                         $timeout.cancel(_timeout);
        //                     });
        //                     $modalInstance.close();
        //                 }
        //             };
        //         }
        //     }
        // });
        // $modalInstance.result.then(function () {
        // }, function () {
        // });
    };

    getReviewers () {
        this.reviewers = this.board.users.filter(u => u.role === 'reviewer');
    };

    isReviewStarted () {
        return this.board.review && this.board.review.startDate &&
            new Date(this.board.review.startDate) < new Date();
    }

    isReviewEnded () {
        return this.board.review && this.board.review.endDate &&
            new Date(this.board.review.endDate) < new Date();
    }

    isReviewActive () {
        return this.board.review && this.isReviewStarted() && !this.isReviewEnded();
    };

    // $scope.getPendingReviewers = function () {
    //     return $scope.getReviewers().filter(function (u) {
    //         return u.status.approval === 'invited';
    //     })
    // };
    // $scope.remindReview = function () {
    //     $http.post('/board/remindReview', {
    //         boardId: $scope.board._id
    //     }).then(function () {
    //         Alert.addAlert('success', "Reminder sent.");
    //     });
    // };

    // $scope.url = $location.absUrl();
    // $scope.searchString = '';
    // $scope.owner = board.owner;
    // $scope.users = angular.copy(board.users);
    // $scope.newUser = {username: '', role: 'viewer'};
    // $scope.allRoles = [{
    //     label: 'can review',
    //     name: 'reviewer',
    //     icon: 'fa-search-plus'
    // }, {
    //     label: 'can view',
    //     name: 'viewer',
    //     icon: 'fa-eye'
    // }];
    // $scope.addUser = function (newUser) {
    //     if ($scope.users.filter(function (o) {
    //             return o.username.toLowerCase() === newUser.username.toLowerCase();
    //         })[0]) {
    //         Alert.addAlert('danger', 'username exists');
    //     } else {
    //         $scope.users.push(newUser);
    //         $scope.newUser = {username: '', role: 'viewer'};
    //         $scope.changesMade = true;
    //     }
    // };
    // $scope.deleteUser = function (index) {
    //     $scope.users.splice(index, 1);
    //     $scope.changesMade = true;
    // };
    // $scope.saveBoardUsers = function () {
    //     if (!$scope.users) $scope.users = [];
    //     $scope.users.push({username: $scope.searchString});
    // };
    // $scope.changeRole = function (newUser, role) {
    //     newUser.role = role.name;
    //     $scope.changesMade = true;
    //     newUser.status = 'invited';
    // };

    okShare () {
        this.http.post('/board/users', {
            boardId: this.board._id,
            user: this.userService.user,
            owner: this.board.owner,
            users: this.users
        }).subscribe(() => {
            this.shareModalRef.close();
            this.board.users = this.users;
        });
    };

    shareBoard () {
        this.shareModalRef = this.modalService.open(this.shareBoardModal, {size: "lg"});
        // $modal.open({
        //     animation: false,
        //     templateUrl: '/board/public/html/shareBoard.html',
        //     controller: 'ShareBoardCtrl',
        //     resolve: {
        //         board: function () {
        //             return $scope.board;
        //         }
        //     }
        // }).result.then(function (users) {
        //     $scope.board.users = users;
        // }, function () {
        // });
    };

    boardApproval (approval) {
        this.http.post('/board/approval', {boardId: this.board._id, approval: approval}).subscribe(() => {
            this.boardStatus = approval;
            this.reload();
        });
    };

    startReview () {
        this.http.post("/board/startReview", {boardId: this.board._id}).map(r => r.json()).subscribe(this.reload,
            response => {
                this.alert.addAlert("danger", response.text());
                this.reload();
        });
    };

    endReview () {
        this.http.post("/board/endReview", {boardId: this.board._id}).subscribe(() => {
            this.reload();
            this.alert.addAlert('success', 'Board review started.');
        }, response =>  {
            this.alert.addAlert("danger", response.text());
            this.reload();
        });
    };

}