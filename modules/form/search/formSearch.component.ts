import { HttpClient } from '@angular/common/http';
import { Component, ComponentFactoryResolver, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { SearchBaseComponent } from 'search/searchBase.component';
import { CdeForm } from 'shared/form/form.model';
import { PinToBoardModalComponent } from 'board/pin-to-board/pin-to-board-modal/pin-to-board-modal.component';

@Component({
    selector: 'cde-form-search',
    styleUrls: ['../../search/searchBase.component.scss'],
    templateUrl: '../../search/searchBase.component.html'
})
export class FormSearchComponent extends SearchBaseComponent {
    @Output() add = new EventEmitter<CdeForm>();

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

        this.module = 'form';
        this._searchType = this.module;
        this.exporters.odm = {id: 'odmExport', display: 'ODM archive'};
        this.pinComponent = PinToBoardModalComponent;
    }
}