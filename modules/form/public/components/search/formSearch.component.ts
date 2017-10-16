import { Component, ComponentFactoryResolver, EventEmitter, Input, Output } from '@angular/core';
import { Http } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ElasticService } from 'core/public/elastic.service';
import { ExportService } from 'core/public/export.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { SearchBaseComponent } from 'search/searchBase.component';
import { OrgHelperService } from 'core/public/orgHelper.service';
import { UserService } from "core/public/user.service";
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '_app/alert/alert.service';

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
                protected exportService: ExportService,
                protected http: Http,
                protected modalService: NgbModal,
                protected elasticService: ElasticService,
                protected orgHelperService: OrgHelperService,
                protected userService: UserService,
                protected router: Router,
                protected route: ActivatedRoute) {
        super(_componentFactoryResolver, alert, elasticService, exportService, http, modalService,
            orgHelperService, userService, router, route);

        this.exporters.odm = {id: "odmExport", display: "ODM Export"};
    }
}
