import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { ElasticQueryResponse } from 'shared/models.model';


@Component({
    selector: 'cde-my-boards',
    templateUrl: './publicBoards.component.html'
})
export class PublicBoardsComponent implements OnInit {
    boards = [];
    filter = {
        search: '',
        selectedTags: [],
        selectedTypes: [],
        selectedShareStatus: ['Public'],
        sortBy: 'name',
        tags: [],
        types: []
    };

    ngOnInit() {
        this.loadPublicBoards();
    }

    constructor(
        private alert: AlertService,
        private http: HttpClient
    ) {
    }

    loadPublicBoards() {
        this.filter.selectedTags = this.filter.tags.filter(a => a.checked).map(a => a.key);
        this.filter.selectedTypes = this.filter.types.filter(a => a.checked).map(a => a.key);
        this.http.post<ElasticQueryResponse>('/boardSearch', this.filter).subscribe(response => {
                this.boards = response.hits.hits.map(h => {
                    h._source._id = h._id;
                    return h._source;
                });
                this.filter.tags = response.aggregations.tagAgg.buckets;
                this.filter.tags.forEach(t => t.checked = (this.filter.selectedTags.indexOf(t.key) > -1));

                this.filter.types = response.aggregations.typeAgg.buckets;
                this.filter.types.forEach(t => t.checked = (this.filter.selectedTypes.indexOf(t.key) > -1));


            }, () => this.alert.addAlert('danger', 'An error occured')
        );
    }

    selectAggregation(aggName, $index) {
        this.filter[aggName][$index].checked = !this.filter[aggName][$index].checked;
        this.loadPublicBoards();
    }
}
