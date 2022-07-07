import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from '_app/user.service';
import { Dictionary } from 'async';
import { BoardFilter } from 'shared/board/board.model';
import {
    Board,
    ElasticQueryResponseAggregationBucket, ElasticQueryResponseAggregations, ItemElastic, ModuleItem
} from 'shared/models.model';
import { noop } from 'shared/util';
import { AlertService } from 'alert/alert.service';

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

    saveBoard(board: Board) {
        this.http.post('/server/board/', board, {responseType: 'text'}).subscribe(() => {
            this.waitAndReload(() => this.alert.addAlert('success', 'Saved.'));
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    deleteBoard(board: Board) {
        this.http.delete('/server/board/' + board._id, {responseType: 'text'}).subscribe(() => {
            this.waitAndReload(() => this.alert.addAlert('success', 'Deleted.'))
        }, err => this.alert.httpErrorMessageAlert(err));
    }

}
