import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, PageEvent } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { AlertService } from 'alert/alert.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { saveAs } from 'file-saver';
import { Comment } from 'shared/models.model';
import { convertToCsv, getCdeCsvHeader, projectItemForExport } from 'core/system/export';

@Component({
    selector: 'cde-board-view',
    templateUrl: './boardView.component.html',
})
export class BoardViewComponent implements OnInit {
    @ViewChild('shareBoardModal') public shareBoardModal: TemplateRef<any>;
    @ViewChild('classifyCdesModal') public classifyCdesModal: ClassifyItemModalComponent;
    allRoles = [{
        label: 'can view',
        name: 'viewer',
        icon: 'fa fa-eye'
    }];
    board: any;
    boardId: string;
    classifyCdesRefModal: MatDialogRef<TemplateRef<any>>;
    commentMode: boolean;
    currentPage: number = 0;
    elts: any[] = [];
    feedbackClass: string[] = [''];
    hasComments: boolean;
    listViews: {};
    modalTitle: string;
    newUser: any = {username: '', role: 'viewer'};
    shareDialogRef: MatDialogRef<TemplateRef<any>>;
    totalItems: number;
    url: string;
    users: any[] = [];

    constructor(private alert: AlertService,
                private dialog: MatDialog,
                public esService: ElasticService,
                private http: HttpClient,
                private orgHelperService: OrgHelperService,
                private route: ActivatedRoute,
                private title: Title,
                protected userService: UserService) {
    }

    ngOnInit() {
        this.boardId = this.route.snapshot.params['boardId'];
        this.reload();
        this.url = location.href;
    }

    addClassification(event) {
        let _timeout = setInterval(() => this.alert.addAlert('warning', 'Classification task is still in progress. Please hold on.'), 3000);
        this.http.post(this.board.type === 'form' ? '/server/classification/classifyFormBoard' : '/server/classification/classifyCdeBoard',
            {
                boardId: this.boardId,
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
        }
    }

    classifyEltBoard() {
        this.classifyCdesRefModal = this.classifyCdesModal.openModal();
    }

    deleteUser(index) {
        this.users.splice(index, 1);
    }

    exportBoard() {
        this.http.get<any>('/server/board/' + this.boardId + '/0/500/?type=csv').subscribe(response => {
            let settings = this.esService.searchSettings;
            let csv = getCdeCsvHeader(settings.tableViewFields);
            response.elts.forEach(ele => {
                csv += convertToCsv(projectItemForExport(ele, settings.tableViewFields));
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

    okShare() {
        this.http.post('/server/board/users', {
            boardId: this.boardId,
            users: this.users
        }, {responseType: 'text'}).subscribe(() => {
            this.shareDialogRef.close();
            this.board.users = this.users;
            this.reload();
        });
    }

    reload() {
        this.http.get<any>('/server/board/' + this.boardId + '/' + (this.currentPage) * 20).subscribe(response => {
            if (response.board) {
                this.board = response.board;
                this.elts = response.elts;
                this.totalItems = response.totalItems;
                this.title.setTitle('Board: ' + this.board.name);
                this.modalTitle = 'Classify ' + (this.board.type === 'form' ? 'Form' : 'CDE') + 's in this Board';
                // this.userService.then(user => {
                //     this.board.users.forEach(u => {
                //         if (u.lastViewed) u.lastViewedLocal = new Date(u.lastViewed).toLocaleDateString();
                //     });
                //      this.orgHelperService.then(() => {
                //         this.elts.forEach(elt => {
                //             elt.usedBy = this.orgHelperService.getUsedBy(elt);
                //         });
                //     }, _noop);
                // }, _noop);

                this.http.get<Comment[]>('/server/discuss/comments/eltId/' + this.boardId).subscribe(
                    res => this.hasComments = res && (res.length > 0),
                    () => this.alert.addAlert('danger', 'Error on loading comments. ')
                );
            }
        }, err => this.alert.httpErrorMessageAlert(err, 'Board'));
    }

    setPage(newPage: PageEvent) {
        let goToPage = newPage.pageIndex;
        if (this.currentPage !== goToPage) {
            this.currentPage = goToPage;
            this.reload();
        }
    }

    shareBoard() {
        this.users = [];
        this.board.users.forEach(u => this.users.push(u));
        this.shareDialogRef = this.dialog.open(this.shareBoardModal, {width: '800px'});
    }

}
