import { Component, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: 'cde-my-boards',
    templateUrl: './publicBoards.component.html',
})
export class PublicBoardsComponent implements OnInit {

    constructor (private alert: AlertService,
                 private http: Http) {}

    boards = [];
    filter = {
        search: "",
        selectedTags: [],
        selectedShareStatus: ['Public'],
        sortBy: 'name',
        sortDirection: 'asc',
        tags: []
    };

    ngOnInit () {
        this.loadPublicBoards();
    }

    loadPublicBoards () {
        this.filter.selectedTags = this.filter.tags.filter(a => a.checked).map(a => a.key);
        this.http.post("/boardSearch", this.filter).map(r => r.json()).subscribe(response => {
            this.boards = response.hits.hits.map(h => {
                h._source._id = h._id;
                return h._source;
            });
            this.filter.tags = response.aggregations.aggregationsName.buckets;
            this.filter.tags.forEach(t => t.checked = (this.filter.selectedTags.indexOf(t.key) > -1));
        }, () => this.alert.addAlert("danger", "An error occured")
        );
    };

    selectAggregation (aggName, $index) {
        this.filter[aggName][$index].checked = !this.filter[aggName][$index].checked;
        this.loadPublicBoards();
    }

}