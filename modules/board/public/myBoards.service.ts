import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";

@Injectable()
export class MyBoardsService {

    constructor(
        private http: Http
    ) {}

    filter: any = {
        tags: [],
        shareStatus: [],
        type: [],
        getSuggestedTags: function (search) {
            let newSuggestTags = this.suggestTags.slice();
            if (search && newSuggestTags.indexOf(search) === -1) {
                newSuggestTags.unshift(search);
            }
            return newSuggestTags;
        },
        sortBy: "createdDate",
        sortDirection: "desc",
        selectedShareStatus: [],
        selectedTags: [],
        suggestTags: []
    };

    public boards: any[];
    public reloading: boolean = false;

    public loadMyBoards() {
        this.filter.selectedShareStatus = this.filter.shareStatus.filter(a => a.checked).map(a => a.key);
        this.filter.selectedTags = this.filter.tags.filter(a => a.checked).map(a => a.key);
        this.http.post("/myBoards", this.filter).map(res => res.json()).subscribe(res => {
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
                this.filter.suggestTags = res.aggregations.tagAgg.buckets.map(t => t.key);
            }
            this.reloading = false;
        });
    };

    public waitAndReload() {
        this.reloading = true;
        setTimeout(() => this.loadMyBoards(), 2000);
    }

}