import { Component, OnInit, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModal, NgbModalModule, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { SharedService } from "core/shared.service";
import { saveAs } from "file-saver";
import { ClassifyItemModalComponent } from "adminItem/public/components/classification/classifyItemModal.component";
import { OrgHelperService } from "core/orgHelper.service";
import { UserService } from "_app/user.service";
import { ElasticService } from "_app/elastic.service";
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: 'cde-board-view',
    templateUrl: './boardView.component.html',
})
export class BoardViewComponent implements OnInit {

    @ViewChild("shareBoardModal") public shareBoardModal: NgbModalModule;
    @ViewChild("classifyCdesModal") public classifyCdesModal: ClassifyItemModalComponent;

    currentPage: number = 1;
    totalItems: number;
    board: any;
    hasComments: boolean;
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
    ROLE_MAP = {
        review: {
            icon: 'fa -fa-search-plus',
            label: 'can review'
        },
        viewer: {
            icon: 'fa fa-eye',
            label: 'can view'
        }
    };

    allRoles = [{
        label: 'can review',
        name: 'reviewer',
        icon: 'fa fa-search-plus'
    }, {
        label: 'can view',
        name: 'viewer',
        icon: 'fa fa-eye'
    }];
    url: string;
    boardId: string;

    shareModalRef: NgbModalRef;
    classifyCdesRefModal: NgbModalRef;

    constructor(private http: Http,
                private alert: AlertService,
                protected userService: UserService,
                private modalService: NgbModal,
                public esService: ElasticService,
                private orgHelper: OrgHelperService,
                private route: ActivatedRoute) {}

    ngOnInit () {
        this.boardId = this.route.snapshot.params['boardId'];
        this.reload();
        this.url = location.href;
    }

    reload () {
        this.http.get("/board/" + this.boardId + "/" + ((this.currentPage - 1) * 20)).map(r => r.json()).subscribe(response => {
            if (response.board) {
                this.board = response.board;
                this.modalTitle = 'Classify ' + (this.board.type === 'form' ? 'Form' : 'CDE') + 's in this Board';

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

                this.userService.then(() => {
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
                this.http.get("/comments/eltId/" + this.board._id)
                    .map(res => res.json()).subscribe(
                    res => this.hasComments = res && (res.length > 0),
                    err => this.alert.addAlert("danger", "Error on loading comments. ")
                );
            }
        }, () => {
            this.alert.addAlert("danger", "Board not found");
        });
    };

    setPage (newPage) {
        if (this.currentPage !== newPage) {
            this.currentPage = newPage;
            this.reload();
        }
    };

    exportBoard () {
        this.http.get('/board/' + this.board._id + '/0/500/?type=csv')
            .map(r => r.json()).subscribe(response => {
                let settings = this.esService.searchSettings;
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
        this.classifyCdesRefModal.close();
    }

    classifyEltBoard () {
        this.classifyCdesRefModal = this.classifyCdesModal.openModal();
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
            }, response => {
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