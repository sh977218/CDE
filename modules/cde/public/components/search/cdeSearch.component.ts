import { HttpClient } from '@angular/common/http';
import { Component, ComponentFactoryResolver, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert.service';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from "_app/user.service";
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { ExportService } from 'core/export.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { SearchBaseComponent, searchStyles } from 'search/searchBase.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-cde-search',
    styles: [searchStyles],
    templateUrl: '../../../../search/searchBase.component.html'
})
export class CdeSearchComponent extends SearchBaseComponent {
    @Input() addMode?: string;
    @Input() embedded = false;
    @Output() add = new EventEmitter<any>();
    module: 'cde'|'form' = 'cde';
    pinComponent = PinBoardModalComponent;

    constructor(
        protected _componentFactoryResolver: ComponentFactoryResolver,
        protected alert: AlertService,
        protected backForwardService: BackForwardService,
        protected exportService: ExportService,
        protected http: HttpClient,
        protected modalService: NgbModal,
        protected elasticService: ElasticService,
        protected orgHelperService: OrgHelperService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected userService: UserService,
        protected dialog: MatDialog
    ) {
        super(_componentFactoryResolver, alert, backForwardService, elasticService, exportService, http, modalService,
            orgHelperService, route, router, userService, dialog);

        this.exporters.csv = {id: 'csvExport', display: 'CSV Export'};
    }
}
