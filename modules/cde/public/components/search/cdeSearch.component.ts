import { HttpClient } from '@angular/common/http';
import { Component, ComponentFactoryResolver, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { SearchBaseComponent, searchStyles } from 'search/searchBase.component';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-cde-search',
    styles: [searchStyles],
    templateUrl: '../../../../search/searchBase.component.html'
})
export class CdeSearchComponent extends SearchBaseComponent {
    @Output() add = new EventEmitter<DataElement>();
    module: 'cde'|'form' = 'cde';
    pinComponent = PinBoardModalComponent;

    constructor(
        protected _componentFactoryResolver: ComponentFactoryResolver,
        protected alert: AlertService,
        protected backForwardService: BackForwardService,
        protected exportService: ExportService,
        protected http: HttpClient,
        protected elasticService: ElasticService,
        protected orgHelperService: OrgHelperService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected userService: UserService,
        protected dialog: MatDialog
    ) {
        super(_componentFactoryResolver, alert, backForwardService, elasticService, exportService, http,
            orgHelperService, route, router, userService, dialog);

        this.exporters.csv = {id: 'csvExport', display: 'CSV Export'};
    }
}
