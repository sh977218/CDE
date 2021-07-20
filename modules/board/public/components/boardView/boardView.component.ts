import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { AlertService } from 'alert/alert.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { saveAs } from 'file-saver';
import { Board, ClassificationClassified, ItemElastic, ListTypes } from 'shared/models.model';
import { convertToCsv, getCdeCsvHeader, projectItemForExport } from 'core/system/export';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

export interface BoardQuery {
    board: Board;
    elts: ItemElastic[];
    totalItems: number;
}

@Component({
    templateUrl: './boardView.component.html',
})
export class BoardViewComponent implements OnInit {
    @ViewChild('classifyCdesModal', {static: true}) classifyCdesModal!: ClassifyItemComponent;
    board!: Board;
    boardId!: string;
    currentPage: number = 0;
    elts: any[] = [];
    feedbackClass: string[] = [''];
    listViews?: ListTypes;
    modalTitle!: string;
    totalItems!: number;
    url!: string;

    constructor(private http: HttpClient,
                private route: ActivatedRoute,
                private title: Title,
                private alert: AlertService,
                private dialog: MatDialog,
                public esService: ElasticService,
                private orgHelperService: OrgHelperService,
                protected userService: UserService) {
    }

    ngOnInit() {
        this.boardId = this.route.snapshot.params.boardId;
        this.reload();
        this.url = location.href;
    }

    addClassification(event: ClassificationClassified) {
        const _timeout = setInterval(() => this.alert.addAlert('warning',
            'Classification task is still in progress. Please hold on.'), 3000);
        this.http.post(this.board.type === 'form' ? '/server/classification/classifyFormBoard' : '/server/classification/classifyCdeBoard',
            {
                boardId: this.boardId,
                categories: event.classificationArray,
                orgName: event.selectedOrg
            }
        ).subscribe(() => {
            clearInterval(_timeout);
            this.alert.addAlert('success', 'All Elements classified.');
        }, () => {
            this.alert.addAlert('danger', 'Unexpected error. Not Elements were classified! You may try again.');
            clearInterval(_timeout);
        });
    }

    classifyEltBoard() {
        this.classifyCdesModal.openModal();
    }

    exportBoard() {
        this.http.get<BoardQuery>('/server/board/' + this.boardId + '/0/500/?type=csv').subscribe(response => {
            const settings = this.esService.searchSettings;
            let csv = getCdeCsvHeader(settings.tableViewFields);
            response.elts.forEach(ele => {
                csv += convertToCsv(projectItemForExport(ele, settings.tableViewFields));
            });
            if (csv) {
                const blob = new Blob([csv], {
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

    reload() {
        this.http.get<BoardQuery>('/server/board/' + this.boardId + '/' + (this.currentPage) * 20).subscribe(response => {
            if (response.board) {
                this.board = response.board;
                this.elts = response.elts;
                this.totalItems = response.totalItems;
                this.title.setTitle('Board: ' + this.board.name);
                this.modalTitle = 'Classify ' + (this.board.type === 'form' ? 'Form' : 'CDE') + 's in this Board';
            }
        }, err => this.alert.httpErrorMessageAlert(err, 'Board'));
    }

    setPage(newPage: PageEvent) {
        const goToPage = newPage.pageIndex;
        if (this.currentPage !== goToPage) {
            this.currentPage = goToPage;
            this.reload();
        }
    }

}
