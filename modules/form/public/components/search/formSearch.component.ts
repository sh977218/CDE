import { HttpClient } from '@angular/common/http';
import { Component, ComponentFactoryResolver, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService } from 'alert/alert.service';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { SearchBaseComponent, searchStyles } from 'search/searchBase.component';
import { CdeForm } from 'shared/form/form.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'cde-form-search',
    styles: [searchStyles],
    templateUrl: '../../../../search/searchBase.component.html'
})
export class FormSearchComponent extends SearchBaseComponent {
    @Input() addMode = '';
    @Input() embedded = false;
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
        this.exporters.odm = {id: 'odmExport', display: 'ODM Export'};
        this.module = 'form';
        this.pinComponent = PinBoardModalComponent;
    }
}
