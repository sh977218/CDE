import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { SearchBaseComponent } from 'search/searchBase.component';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-cde-search',
    styleUrls: ['../../search/searchBase.component.scss'],
    templateUrl: '../../search/searchBase.component.html',
})
export class CdeSearchComponent extends SearchBaseComponent {
    @Output() add = new EventEmitter<DataElement>();

    constructor(
        protected alert: AlertService,
        protected backForwardService: BackForwardService,
        public exportService: ExportService,
        protected http: HttpClient,
        protected elasticService: ElasticService,
        protected orgHelperService: OrgHelperService,
        protected route: ActivatedRoute,
        protected router: Router,
        public userService: UserService,
        protected dialog: MatDialog
    ) {
        super(
            alert,
            backForwardService,
            elasticService,
            exportService,
            http,
            orgHelperService,
            route,
            router,
            userService,
            dialog
        );

        this.module = 'cde';
        this._searchType = this.module;
        this.exporters.csv = { id: 'csvExport', display: 'CSV file' };
    }
}
