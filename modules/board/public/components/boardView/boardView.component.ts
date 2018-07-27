import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _noop from 'lodash/noop';
import { saveAs } from 'file-saver';

import { AlertService } from '_app/alert.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { OrgHelperService } from 'core/orgHelper.service';
import { Comment } from 'shared/models.model';
import { convertToCsv, getCdeCsvHeader, projectCdeForExport } from 'shared/system/exportShared';


@Component({
    selector: 'cde-board-view',
    templateUrl: './boardView.component.html',
})
export class BoardViewComponent implements OnInit {
    @ViewChild('shareBoardModal') public shareBoardModal: NgbModalModule;
    @ViewChild('classifyCdesModal') public classifyCdesModal: ClassifyItemModalComponent;
    allRoles = [{
        label: 'can review',
        name: 'reviewer',
        icon: 'fa fa-search-plus'
    }, {
        label: 'can view',
        name: 'viewer',
        icon: 'fa fa-eye'
    }];
    board: any;
    boardId: string;
    boardStatus: any;
    canReview: boolean;
    classifyCdesRefModal: NgbModalRef;
    commentMode: boolean;
    currentPage: number = 1;
    elts: any[] = [];
    feedbackClass: string[] = [''];
    hasComments: boolean;
    isModifiedSinceReview: boolean;
    listViews: {};
    modalTitle: string;
    newUser: any = {username: '', role: 'viewer'};
    reviewers: any[];
    shareModalRef: NgbModalRef;
    totalItems: number;
    url: string;
    users: any[] = [];

    ngOnInit() {
        this.boardId = this.route.snapshot.params['boardId'];
        this.http.get('/server/board/viewBoard/' + this.boardId).subscribe();
        this.reload();
        this.url = location.href;
    }

    constructor(private alert: AlertService,
                public esService: ElasticService,
                private http: HttpClient,
                private modalService: NgbModal,
                private orgHelperService: OrgHelperService,
                private route: ActivatedRoute,
                protected userService: UserService) {
    }

    addClassification(event) {
        let _timeout = setInterval(() => this.alert.addAlert('warning', 'Classification task is still in progress. Please hold on.'), 3000);
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
            this.alert.addAlert('success', 'All Elements classified.');
        }, () => {
            this.alert.addAlert('danger', 'Unexpected error. Not Elements were classified! You may try again.');
            clearInterval(_timeout);
        });
        this.classifyCdesRefModal.close();
    }

    addUser(newUser) {
        if (this.users.filter(o => o.username.toLowerCase() === newUser.username.toLowerCase())[0]) {
            this.alert.addAlert('danger', 'username exists');
        } else {
            this.users.push(newUser);
            this.newUser = {username: '', role: 'viewer'};
            this.getReviewers();
        }
    }

    boardApproval(approval) {
        this.http.post('/server/board/approval', {boardId: this.board._id, approval: approval}).subscribe(() => {
            this.boardStatus = approval;
            this.reload();
        });
    }

    classifyEltBoard() {
        this.classifyCdesRefModal = this.classifyCdesModal.openModal();
    }

    deleteUser(index) {
        this.users.splice(index, 1);
    }

    endReview() {
        this.http.post('/server/board/endReview', {boardId: this.board._id}).subscribe(() => {
            this.reload();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            this.reload();
        });
    }

    exportBoard() {
        this.http.get<any>('/server/board/' + this.board._id + '/0/500/?type=csv').subscribe(response => {
            let settings = this.esService.searchSettings;
            let csv = getCdeCsvHeader(settings.tableViewFields);
            response.elts.forEach(ele => {
                csv += convertToCsv(projectCdeForExport(ele, settings.tableViewFields));
            });
            if (csv) {
                let blob = new Blob([csv], {
                    type: 'text/csv'
                });
                saveAs(blob, 'BoardExport' + '.csv');  // jshint ignore:line
                this.alert.addAlert('success', 'Export downloaded.');
                this.feedbackClass = ['fa-download'];
            } else {
                this.alert.addAlert('danger', 'The server is busy processing similar request, please try again in a minute.');
            }
        });
    }

    getReviewers() {
        this.reviewers = this.board.users.filter(u => u.role === 'reviewer');
    }

    isReviewActive() {
        return this.board.review && this.isReviewStarted() && !this.isReviewEnded();
    }

    isReviewEnded() {
        return this.board.review && this.board.review.endDate &&
            new Date(this.board.review.endDate) < new Date();
    }

    isReviewStarted() {
        return this.board.review && this.board.review.startDate &&
            new Date(this.board.review.startDate) < new Date();
    }

    okShare() {
        this.http.post('/server/board/users', {
            boardId: this.board._id,
            users: this.users
        }, {responseType: 'text'}).subscribe(() => {
            this.shareModalRef.close();
            this.board.users = this.users;
            this.reload();
        });
    }

    reload() {
        this.http.get<any>('/server/board/' + this.boardId + '/' + ((this.currentPage - 1) * 20)).subscribe(response => {
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

                this.userService.then(user => {
                    this.board.users.forEach(u => {
                        if (u.username === user.username &&
                            u.role === 'reviewer' && u.status.approval === 'approved' &&
                            new Date(this.board.updatedDate) >= new Date(u.status.reviewedDate)) {
                            this.isModifiedSinceReview = true;
                        }
                        if (u.lastViewed) u.lastViewedLocal = new Date(u.lastViewed).toLocaleDateString();
                        if (u.username === user.username) {
                            this.boardStatus = u.status.approval;
                        }
                    });
                    this.canReview = this.isReviewActive() &&
                        this.board.users.filter(
                            u => u.role === 'reviewer' && u.username && u.username.toLowerCase() === user.username.toLowerCase()
                        ).length > 0;
                    this.orgHelperService.then(() => {
                        this.elts.forEach(elt => {
                            elt.usedBy = this.orgHelperService.getUsedBy(elt);
                        });
                    }, _noop);
                }, _noop);

                this.getReviewers();

                this.http.get<Comment[]>('/server/discuss/comments/eltId/' + this.board._id).subscribe(
                    res => this.hasComments = res && (res.length > 0),
                    () => this.alert.addAlert('danger', 'Error on loading comments. ')
                );
            }
        }, () => this.alert.addAlert('danger', 'Board not found'));
    }

    setPage(newPage) {
        if (this.currentPage !== newPage) {
            this.currentPage = newPage;
            this.reload();
        }
    }

    shareBoard() {
        this.users = [];
        this.board.users.forEach(u => this.users.push(u));
        this.shareModalRef = this.modalService.open(this.shareBoardModal, {size: 'lg'});
    }

    startReview() {
        this.http.post('/server/board/startReview', {boardId: this.board._id}, {responseType: 'text'}).subscribe(() => {
                this.reload();
            }, err => {
                this.alert.httpErrorMessageAlert(err);
                this.reload();
            }
        );
    }
}
