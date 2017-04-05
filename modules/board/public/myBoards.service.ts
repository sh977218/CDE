import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";

@Injectable()
export class MyBoardsService {

    constructor(
        private http: Http
    ) {}

    filter: any = {
        tags: [],
        shareStatus: [],
        type:[],
        getSuggestedTags: function (search) {
            let newSuggestTags = this.suggestTags.slice();
            if (search && newSuggestTags.indexOf(search) === -1) {
                newSuggestTags.unshift(search);
            }
            return newSuggestTags;
        },
        sortBy: 'createdDate',
        sortDirection: 'desc',
        selectedShareStatus: [],
        selectedTags: [],
        suggestTags: []
    };

    public boards: any[];

    public loadMyBoards() {
        this.http.post('/myBoards', this.filter).map(res => res.json()).subscribe(res => {
            if (res.hits) {
                this.boards = res.hits.hits.map(h => {
                    h._source._id = h._id;
                    return h._source;
                });
                this.filter.tags = res.aggregations.tagAgg.buckets;
                this.filter.types = res.aggregations.typeAgg.buckets;
                this.filter.shareStatus = res.aggregations.ssAgg.buckets;
                this.filter.suggestTags = res.aggregations.tagAgg.buckets.map(t => t.key);
            }
        });
    };


}