import { Component, ComponentFactoryResolver, EventEmitter, Inject, Input, Output, Type } from '@angular/core';
import { Http } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'system/public/components/alert/alert.service';
import { ElasticService } from 'core/public/elastic.service';
import { ExportService } from 'core/public/export.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { SearchBaseComponent } from 'search/searchBase.component';
import { OrgHelperService } from 'core/public/orgHelper.service';

@Component({
    selector: 'cde-form-search',
    templateUrl: '../../../../search/searchBase.component.html'
})
export class FormSearchComponent extends SearchBaseComponent {
    @Input() addMode: string = undefined;
    @Input() embedded = false;
    @Output() add = new EventEmitter<any>();

    module = 'form';
    pinComponent: any = PinBoardModalComponent;

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

        this.exporters.odm = {id: "odmExport", display: "ODM Export"};
    }
}
