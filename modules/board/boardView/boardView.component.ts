import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SearchModule } from 'search/search.module';
import { CompareModule } from 'compare/compare.module';
import { BoardModule } from 'board/board.module';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { AlertService } from 'alert/alert.service';
import { convertToCsv, getCdeCsvHeader, projectItemForExport } from 'core/system/export';
import { saveAs } from 'file-saver';
import { handleDropdown } from 'non-core/dropdown';
import { Board, ClassificationClassified, ItemElastic, ListTypes } from 'shared/models.model';
import { BoardListService } from 'board/listView/boardList.service';

export interface BoardQuery {
    board: Board;
    elts: ItemElastic[];
    totalItems: number;
}

@Component({
    templateUrl: './boardView.component.html',
    imports: [NgIf, MatIconModule, SearchModule, CompareModule, BoardModule, MatPaginatorModule, AdminItemModule],
    standalone: true,
})
export class BoardViewComponent implements OnInit, OnDestroy {
    @ViewChild('classifyCdesModal', { static: true }) classifyCdesModal!: ClassifyItemComponent;
    board!: Board;
    boardId!: string;
    currentPage: number = 0;
    dropdownHandler: (() => void) | null = null;
    dropdownMenus: HTMLElement[] = [];
    dropdownUnregister: (() => void) | null = null;
    elts: any[] = [];
    listViews?: ListTypes;
    modalTitle!: string;
    totalItems!: number;
    url!: string;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private title: Title,
        private alert: AlertService,
        public esService: ElasticService,
        public userService: UserService,
        private boardListService: BoardListService
    ) {
        if (!this.dropdownUnregister) {
            [this.dropdownHandler, this.dropdownUnregister] = handleDropdown(this.dropdownMenus);
        }
    }

    ngOnInit() {
        this.boardId = this.route.snapshot.params.boardId;
        this.reload();
        this.url = location.href;
    }

    ngOnDestroy() {
        if (this.dropdownUnregister) {
            this.dropdownUnregister();
            this.dropdownHandler = null;
            this.dropdownUnregister = null;
        }
    }

    addClassification(event: ClassificationClassified) {
        const timeout = setInterval(
            () => this.alert.addAlert('warning', 'Classification task is still in progress. Please hold on.'),
            3000
        );
        this.http
            .post(
                this.board.type === 'form'
                    ? '/server/classification/classifyFormBoard'
                    : '/server/classification/classifyCdeBoard',
                {
                    boardId: this.boardId,
                    categories: event.classificationArray,
                    orgName: event.selectedOrg,
                }
            )
            .subscribe(
                () => {
                    clearInterval(timeout);
                    this.alert.addAlert('success', 'All Elements classified.');
                },
                () => {
                    this.alert.addAlert('danger', 'Unexpected error. Not Elements were classified! You may try again.');
                    clearInterval(timeout);
                }
            );
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
                    type: 'text/csv',
                });
                saveAs(blob, 'BoardExport' + '.csv'); // jshint ignore:line
                this.alert.addAlert('success', 'Export downloaded.');
            } else {
                this.alert.addAlert(
                    'danger',
                    'The server is busy processing similar request, please try again in a minute.'
                );
            }
        });
    }

    openMenu(event: MouseEvent, dropdownMenu: HTMLElement) {
        const isOpen = dropdownMenu.classList.contains('show');
        if (this.dropdownHandler) {
            this.dropdownHandler();
        }
        if (!isOpen) {
            dropdownMenu.classList.toggle('show');
            this.dropdownMenus.push(dropdownMenu);
        }
        event.stopPropagation();
    }

    reload() {
        this.http.get<BoardQuery>('/server/board/' + this.boardId + '/' + this.currentPage * 20).subscribe(
            response => {
                if (response.board) {
                    this.board = response.board;
                    this.elts = response.elts;
                    this.totalItems = response.totalItems;
                    this.title.setTitle('Board: ' + this.board.name);
                    this.modalTitle = 'Classify ' + (this.board.type === 'form' ? 'Form' : 'CDE') + 's in this Board';
                    this.boardListService.board = this.board;
                    this.boardListService.currentPage = this.currentPage;
                    this.boardListService.totalItems = this.totalItems;
                }
            },
            err => this.alert.httpErrorAlert(err, 'Board')
        );
    }

    setPage(newPage: PageEvent) {
        const goToPage = newPage.pageIndex;
        if (this.currentPage !== goToPage) {
            this.currentPage = goToPage;
            this.reload();
        }
    }
}
