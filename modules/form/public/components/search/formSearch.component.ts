import { Component, ComponentFactoryResolver, EventEmitter, Input, Output } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { ExportService } from 'core/export.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { SearchBaseComponent } from 'search/searchBase.component';
import { OrgHelperService } from 'core/orgHelper.service';
import { UserService } from "_app/user.service";

@Component({
    selector: 'cde-form-search',
    templateUrl: '../../../../search/searchBase.component.html',
    styles: [`
        .browseLink {
            color: #337ab7;
        }

        .browseLink:hover {
            color: #23527c;
            text-decoration: underline;
        }
    `]
})
export class FormSearchComponent extends SearchBaseComponent {
    @Input() addMode: string = undefined;
    @Input() embedded = false;
    @Output() add = new EventEmitter<any>();

    module = 'form';
    pinComponent: any = PinBoardModalComponent;

    constructor(protected _componentFactoryResolver: ComponentFactoryResolver,
                protected alert: AlertService,
                protected backForwardService: BackForwardService,
                protected exportService: ExportService,
                protected http: Http,
                protected modalService: NgbModal,
                protected elasticService: ElasticService,
                protected orgHelperService: OrgHelperService,
                protected route: ActivatedRoute,
                protected router: Router,
                protected userService: UserService) {
        super(_componentFactoryResolver, alert, backForwardService, elasticService, exportService, http, modalService,
            orgHelperService, route, router, userService);

        this.exporters.odm = {id: "odmExport", display: "ODM Export"};
    }
}
