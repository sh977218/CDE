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
import { MatMenuModule } from '@angular/material/menu';
import { NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TourAnchorMatMenuDirective } from 'ngx-ui-tour-md-menu';
import { SearchModule } from 'search/search.module';
import { PinToBoardModule } from 'board/pin-to-board.module';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RegistrationValidatorService } from 'non-core/registrationValidator.service';

@Component({
    selector: 'cde-cde-search',
    styleUrls: ['../../search/searchBase.component.scss'],
    templateUrl: '../../search/searchBase.component.html',
    imports: [
        MatMenuModule,
        NgIf,
        FormsModule,
        MatIconModule,
        MatAutocompleteModule,
        MatTooltipModule,
        NgForOf,
        TourAnchorMatMenuDirective,
        SearchModule,
        UpperCasePipe,
        PinToBoardModule,
        MatInputModule,
        MatPaginatorModule,
    ],
    providers: [ExportService, RegistrationValidatorService],
    standalone: true,
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
