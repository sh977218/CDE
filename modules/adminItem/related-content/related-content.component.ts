import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MoreLikeThisDataElement } from 'cde/mlt/moreLikeThis.component';
import { HttpClient } from '@angular/common/http';
import { AlertService } from 'alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { SearchSettings } from 'shared/search/search.model';
import { ElasticQueryResponseForm } from 'shared/models.model';
import { CdeFormElastic } from 'shared/form/form.model';

@Component({
    selector: 'cde-related-content',
    templateUrl: './related-content.component.html',
    styleUrls: ['./related-content.component.scss'],
})
export class RelatedContentComponent implements OnInit {
    @Input() elt;
    dataSets = [];
    mltCdes = [];
    linkedForms: CdeFormElastic[] = [];

    defaultTabIndex = 0;

    @ViewChild('tabGroup') tabGroup;

    constructor(
        private http: HttpClient,
        private alert: AlertService,
        private elasticService: ElasticService
    ) {}

    ngOnInit(): void {
        this.dataSets = this.elt.dataSets;
        this.http
            .get<{ cdes: MoreLikeThisDataElement[] }>(
                `/server/de/moreLike/${this.elt.tinyId}`
            )
            .subscribe(
                response => {
                    this.mltCdes = response.cdes;
                },
                () => this.alert.addAlert('error', 'Unable to retrieve MLT')
            );

        const tinyId = this.elt.tinyId;
        const searchSettings = new SearchSettings();
        searchSettings.q = `"${tinyId}"`;
        this.elasticService.generalSearchQuery(
            this.elasticService.buildElasticQuerySettings(searchSettings),
            'form',
            (err?: string, result?: ElasticQueryResponseForm) => {
                if (err || !result) {
                    return;
                }
                this.linkedForms = result.forms;
            }
        );
    }

    tabChanged(e) {
        this.defaultTabIndex = e;
    }
}
