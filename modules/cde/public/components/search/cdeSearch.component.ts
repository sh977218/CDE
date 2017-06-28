import { Component, ComponentFactoryResolver, EventEmitter, Inject, Input, Output, Type } from '@angular/core';
import { Http } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'system/public/components/alert/alert.service';
import { CdeAccordionListComponent } from 'cde/public/components/listView/cdeAccordionList.component';
import { CdeSummaryListContentComponent } from 'cde/public/components/listView/cdeSummaryListContent.component';
import { ElasticService } from 'core/public/elastic.service';
import { ExportService } from 'core/public/export.service';
import { PinModalComponent } from 'board/public/components/pins/pinModal.component';
import { SearchBaseComponent } from 'search/searchBase.component';
import { SummaryListComponent } from 'search/listView/summaryList.component';
import { TableListComponent } from 'search/listView/tableList.component';
import { OrgHelperService } from 'core/public/orgHelper.service';

@Component({
    selector: 'cde-cde-search',
    templateUrl: '../../../../search/searchBase.component.html'
})
export class CdeSearchComponent extends SearchBaseComponent {
    @Input() addMode: string = undefined;
    @Input() embedded = false;
    @Output() add = new EventEmitter<any>();

    module = 'cde';
    pinComponent: any = PinModalComponent;

    constructor(protected _componentFactoryResolver: ComponentFactoryResolver,
                protected alert: AlertService,
                protected exportService: ExportService,
                protected http: Http,
                protected modalService: NgbModal,
                protected elasticService: ElasticService,
                @Inject('ElasticBoard') protected elasticBoard,
                protected orgHelperService: OrgHelperService,
                @Inject('userResource') protected userService) {
        super(_componentFactoryResolver, alert, elasticService, elasticBoard, exportService, http, modalService,
            orgHelperService, userService);
    }
}
