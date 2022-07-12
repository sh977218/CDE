import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from '_app/user.service';
import { Dictionary } from 'async';
import { BoardFilter } from 'shared/board/board.model';
import {
    Board, ElasticQueryResponseAggregationBucket, ElasticQueryResponseAggregations, ItemElastic, ModuleItem
} from 'shared/models.model';
import { noop } from 'shared/util';
import { PinBoardSnackbarComponent } from 'board/snackbar/pinBoardSnackbar.component';
import { AlertService } from 'alert/alert.service';
import { MAX_PINS } from 'shared/constants';

@Injectable()
export class MyBoardsService {
    boards?: any[];
    filter: BoardFilter & {
        shareStatus: ElasticQueryResponseAggregationBucket[];
        sortDirection: 'asc' | 'desc';
        suggestTags: string[];
    } & Dictionary<any> = {
        selectedShareStatus: [],
        selectedTags: [],
        selectedTypes: [],
        shareStatus: [],
        sortBy: 'createdDate',
        sortDirection: 'desc',
        suggestTags: [],
        tags: [],
        types: []
    };
    reloading = false;

    constructor(private http: HttpClient,
                private alert: AlertService,
                private userService: UserService) {
        if (userService.user) {
            this.loadMyBoards();
        }
    }

    loadMyBoards(type?: ModuleItem, cb = noop) {
        this.filter.selectedShareStatus = this.filter.shareStatus.filter(a => a.checked).map(a => a.key);
        this.filter.selectedTags = this.filter.tags.filter(a => a.checked).map(a => a.key);
        this.filter.selectedTypes = this.filter.types.filter(a => a.checked).map(a => a.key);
        this.http.post<ElasticQueryResponseAggregations<ItemElastic>>('/server/board/myBoards', this.filter).subscribe(res => {
            if (res.hits) {
                this.boards = res.hits.hits.map(h => {
                    h._source._id = h._id;
                    return h._source;
                });
                this.filter.tags = res.aggregations.tagAgg.buckets;
                this.filter.tags.forEach(t => t.checked = (this.filter.selectedTags.indexOf(t.key) > -1));
                this.filter.types = res.aggregations.typeAgg.buckets;
                this.filter.shareStatus = res.aggregations.ssAgg.buckets;
                this.filter.shareStatus.forEach(ss => ss.checked = (this.filter.selectedShareStatus.indexOf(ss.key) > -1));
                this.filter.types.forEach(t => t.checked = (this.filter.selectedTypes.indexOf(t.key) > -1));
                this.filter.suggestTags = res.aggregations.tagAgg.buckets.map(t => t.key);
            }
            this.reloading = false;
            if (type && this.boards) {
                this.boards = this.boards.filter(b => b.type === type);
            }
            this.sortBoardList(type);
            cb();
        }, cb);
    }

    sortBoardList(type?: ModuleItem) {
        const defaultBoardId = type === 'form' ? this.userService.user?.formDefaultBoard : this.userService.user?.cdeDefaultBoard;
        if (type && defaultBoardId && this.boards) {
            const boardIdx = this.boards.findIndex(b => b._id === defaultBoardId);
            if (boardIdx > 0) {
                this.boards.splice(0, 0, this.boards.splice(boardIdx, 1)[0]);
            }
        }
    }

    waitAndReload(cb = noop) {
        setTimeout(() => this.loadMyBoards(undefined, cb), 2000);
    }

    createDefaultBoard(module) {
        const name = `${module === 'cde' ? 'CDE' : 'Form'} Board 1`;
        const defaultBoard = {
            type: module,
            pins: [],
            name,
            description: '',
            shareStatus: 'Private'
        };
        return this.http.post<Board>('/server/board', defaultBoard);
    }

    addToDefaultBoard(module, eltsToPin) {
        this.addToBoard(this.boards[0], module, eltsToPin)
    }

    addAllToBoard(board, module, elasticsearchPinQuery) {
        const data = {
            query: elasticsearchPinQuery,
            boardId: board._id,
            itemType: module
        }
        data.query.resultPerPage = MAX_PINS;
        this.http.post('/server/board/pinEntireSearchToBoard', data, {responseType: 'text'})
            .subscribe(() => {
                this.alert.addAlertFromComponent('success', PinBoardSnackbarComponent, {
                    message: 'All elements pinned to ',
                    boardId: board._id,
                    boardName: board.name
                });
            }, () => this.alert.addAlert('danger', 'Not all elements were not pinned!'));
    }

    saveBoard(board: Board) {
        return this.http.post('/server/board/', board, {responseType: 'text'})
    }

    deleteBoard(board: Board) {
        return this.http.delete('/server/board/' + board._id, {responseType: 'text'})
    }

    addToBoard(board, module, eltsToPin) {
        return this.http.put('/server/board/pinToBoard/', {
            boardId: board._id,
            tinyIdList: eltsToPin.map(e => e.tinyId),
            type: module
        })
    }
    createBoard(board) {
        return this.http.post('/server/board', board, {responseType: 'text'});
    }

}
