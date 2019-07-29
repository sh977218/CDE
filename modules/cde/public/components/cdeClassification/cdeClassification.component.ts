import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { ClassificationService } from 'non-core/classification.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { MatDialogRef } from '@angular/material';


@Component({
    selector: 'cde-cde-classification',
    templateUrl: './cdeClassification.component.html'
})
export class CdeClassificationComponent {
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('classifyItemComponent') classifyItemComponent: ClassifyItemModalComponent;
    classifyItemModalRef: MatDialogRef<TemplateRef<any>>;

    constructor(
        private alert: AlertService,
        private classificationSvc: ClassificationService,
        public http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService,
    ) {
    }

    classifyItem(event) {
        this.classificationSvc.classifyItem(
            this.elt,
            event.selectedOrg,
            event.classificationArray,
            '/server/classification/addCdeClassification/',
            (err: HttpErrorResponse) => {
                this.classifyItemModalRef.close();
                if (err) {
                    if (err.status === 409) { this.alert.addAlert('danger', 'Classification Already Exists'); }
                    else { this.alert.addAlert('danger', 'Unexpected error adding classification'); }
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification added.'));
                }
            }
        );
    }

    openClassifyItemModal() {
        this.classifyItemModalRef = this.classifyItemComponent.openModal();
    }

    reloadElt(cb) {
        this.http.get('de/' + this.elt.tinyId).subscribe(res => {
            this.elt = res;
            this.onEltChange.emit(this.elt);
            if (cb) { cb(); }
        }, err => {
            if (err) { this.alert.addAlert('danger', 'Error retrieving. ' + err); }
            if (cb) { cb(); }
        });
    }

    removeClassif(event) {
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
