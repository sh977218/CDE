import { Component, Inject, OnInit } from "@angular/core";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: 'cde-my-boards',
    templateUrl: './publicBoards.component.html',
})
export class PublicBoardsComponent implements OnInit {

    constructor (private alert: AlertService,
                 @Inject('ElasticBoard') protected elasticBoard) {}

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
        this.elasticBoard.basicSearch(this.filter, (err, response) => {
            if (err) this.alert.addAlert("danger", "An error occured");
            this.boards = response.hits.hits.map(h => {
                h._source._id = h._id;
                return h._source;
            });
            this.filter.tags = response.aggregations.aggregationsName.buckets;
            this.filter.tags.forEach(t => t.checked = (this.filter.selectedTags.indexOf(t.key) > -1));
        });
    };

    selectAggregation (aggName, $index) {
        this.filter[aggName][$index].checked = !this.filter[aggName][$index].checked;
        this.loadPublicBoards();
    }

}