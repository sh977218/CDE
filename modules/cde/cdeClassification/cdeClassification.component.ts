import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UserService } from '_app/user.service';
import { DeletedNodeEvent } from 'adminItem/classification/classificationView.component';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { AlertService } from 'alert/alert.service';
import { ClassificationService } from 'non-core/classification.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { DataElement } from 'shared/de/dataElement.model';
import { ITEM_MAP } from 'shared/item';
import { Cb, ClassificationClassified } from 'shared/models.model';
import { canClassify } from 'shared/security/authorizationShared';

@Component({
    selector: 'cde-cde-classification',
    templateUrl: './cdeClassification.component.html',
    styles: [`
        #classificationBody {
            overflow: auto;
            width: 100%;
            max-height: 500px;
        }
    `]
})
export class CdeClassificationComponent {
    @Input() elt!: DataElement;
    @Output() eltChange = new EventEmitter<DataElement>();
    @ViewChild('classifyItemComponent', {static: true}) classifyItemComponent!: ClassifyItemComponent;
    canClassify = canClassify;

    constructor(
        private alert: AlertService,
        private classificationSvc: ClassificationService,
        public http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService,
    ) {
    }

    classifyItem(event: ClassificationClassified) {
        this.classificationSvc.classifyItem(
            this.elt,
            event.selectedOrg,
            event.classificationArray,
            '/server/classification/addCdeClassification/',
            (err: HttpErrorResponse | void) => {
                if (err) {
                    if (err.status === 409) {
                        this.alert.addAlert('danger', 'Classification Already Exists');
                    } else {
                        this.alert.addAlert('danger', 'Unexpected error adding classification');
                    }
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification added.'));
                }
            }
        );
    }

    openClassifyItemModal() {
        this.classifyItemComponent.openModal();
    }

    reloadElt(cb: Cb) {
        this.http.get<DataElement>(ITEM_MAP.cde.api + this.elt.tinyId).subscribe(res => {
            this.elt = res;
            this.eltChange.emit(this.elt);
            if (cb) {
                cb();
            }
        }, err => {
            if (err) {
                this.alert.addAlert('danger', 'Error retrieving. ' + err);
            }
            if (cb) {
                cb();
            }
        });
    }

    removeClassif(event: DeletedNodeEvent) {
        this.classificationSvc.removeClassification(this.elt, event.deleteOrgName,
            event.deleteClassificationArray, '/server/classification/removeCdeClassification/', err => {
                if (err) {
                    this.alert.addAlert('danger', 'Unexpected error removing classification');
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification removed.'));
                }
            });
    }
}
