import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _noop from 'lodash/noop';
import { ElasticQueryResponseAggregationBucket, ElasticQueryResponseAggregations, ItemElastic, ModuleItem } from 'shared/models.model';
import { Dictionary } from 'async';

export interface BoardFilter {
    selectedTags: string[];
    selectedTypes: string[];
    selectedShareStatus: string[];
    sortBy: string;
    tags: ElasticQueryResponseAggregationBucket[];
    types: ElasticQueryResponseAggregationBucket[];
}

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

    constructor(private http: HttpClient) {
    }

    loadMyBoards(type?: ModuleItem, cb = _noop) {
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
            if (type && this.boards) { this.boards = this.boards.filter(b => b.type === type); }
            cb();
        }, cb);
    }

    waitAndReload(cb = _noop) {
        this.reloading = true;
        setTimeout(() => this.loadMyBoards(undefined, cb), 2000);
    }
}
