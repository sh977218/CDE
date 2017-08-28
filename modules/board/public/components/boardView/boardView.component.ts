import { Component, Inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { AlertService } from "system/public/components/alert/alert.service";
import { NgbModal, NgbModalModule, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { SharedService } from "core/public/shared.service";
import { saveAs } from "cde/public/assets/js/FileSaver.js";
import { ClassifyItemModalComponent } from "adminItem/public/components/classification/classifyItemModal.component";
import { OrgHelperService } from "core/public/orgHelper.service";

@Component({
    selector: 'cde-board-view',
    templateUrl: './boardView.component.html',
})
export class BoardViewComponent implements OnInit {

    @Input() boardId: string;
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
    changesMade: boolean;
    newUser: any = {username: '', role: 'viewer'};
    allRoles = [{
        label: 'can review',
        name: 'reviewer',
        icon: 'fa-search-plus'
    }, {
        label: 'can view',
        name: 'viewer',
        icon: 'fa-eye'
    }];
    url: string;

    shareModalRef: NgbModalRef;

    constructor(private http: Http,
                private alert: AlertService,
                @Inject('userResource') protected userService,
                private modalService: NgbModal,
                @Inject('SearchSettings') public searchSettings,
                private orgHelper: OrgHelperService) {}

    ngOnInit () {
        this.reload();
        this.url = location.href;
    }

    reload () {
        this.http.get("/board/" + this.boardId + "/" + ((this.currentPage - 1) * 20)).map(r => r.json()).subscribe(response => {
            if (response.board) {
                this.board = response.board;
                this.modalTitle = 'Classify ' + (this.board.type === 'form' ? 'Form' : 'CDE') + 's in this Board';
                // if (this.board.type === "form")
                //     $scope.quickBoard = $scope.formQuickBoard;

                // $scope.module = $scope.board.type;
                this.totalItems = response.totalItems;
                // $scope.numPages = $scope.totalItems / 20;
                let pins = this.board.pins;
                let respElts = response.elts;
                this.elts = [];
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

                this.elts.forEach(elt => elt.usedBy = this.orgHelper.getUsedBy(elt));
                this.board.users.filter(u => {
                    if (u.lastViewed) u.lastViewedLocal = new Date(u.lastViewed).toLocaleDateString();
                    if (u.username === this.userService.user.username) {
                        this.boardStatus = u.status.approval;
                    }
                });
            }
        }, () => {
            this.alert.addAlert("danger", "Board not found");
        });
    };

    setPage (newPage) {
        if (this.currentPage !== newPage) this.reload();
    };

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

    // $scope.searchString = '';

    addUser (newUser) {
        if (this.users.filter(o => o.username.toLowerCase() === newUser.username.toLowerCase())[0]) {
            this.alert.addAlert('danger', 'username exists');
        } else {
            this.users.push(newUser);
            this.newUser = {username: '', role: 'viewer'};
            this.changesMade = true;
            this.getReviewers();
        }
    };

    deleteUser (index) {
        this.users.splice(index, 1);
        this.changesMade = true;
    };

    // $scope.saveBoardUsers = function () {
    //     if (!$scope.users) $scope.users = [];
    //     $scope.users.push({username: $scope.searchString});
    // };

    changeRole (newUser, role) {
        newUser.role = role.name;
        this.changesMade = true;
        newUser.status = 'invited';
    };

    okShare () {
        this.http.post('/board/users', {
            boardId: this.board._id,
            users: this.users
        }).subscribe(() => {
            this.shareModalRef.close();
            this.board.users = this.users;
            this.reload();
        });
    };

    shareBoard () {
        this.users = [];
        this.board.users.forEach(u => this.users.push(u));
        this.shareModalRef = this.modalService.open(this.shareBoardModal, {size: "lg"});
    };

    boardApproval (approval) {
        this.http.post('/board/approval', {boardId: this.board._id, approval: approval}).subscribe(() => {
            this.boardStatus = approval;
            this.reload();
        });
    };

    startReview () {
        this.http.post("/board/startReview", {boardId: this.board._id}).map(r => r.text()).subscribe(() => {
            this.reload();
            },
            response => {
                this.alert.addAlert("danger", response);
                this.reload();
            }
        );
    };

    endReview () {
        this.http.post("/board/endReview", {boardId: this.board._id}).map(r => r.text()).subscribe(() => {
            this.reload();
        }, response =>  {
            this.alert.addAlert("danger", response);
            this.reload();
        });
    };

}