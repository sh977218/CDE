import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { ClassificationService } from 'core/classification.service';
import { IsAllowedService } from 'core/isAllowed.service';


@Component({
    selector: 'cde-cde-classification',
    templateUrl: './cdeClassification.component.html'
})
export class CdeClassificationComponent {
    @Input() elt: any;
    @ViewChild('classifyItemComponent') classifyItemComponent: ClassifyItemModalComponent;
    classifyItemModalRef: NgbModalRef;

    constructor(
        private alert: AlertService,
        private classificationSvc: ClassificationService,
        public http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService,
    ) {
    }

    classifyItem(event) {
        this.classificationSvc.classifyItem(this.elt, event.selectedOrg, event.classificationArray,
            '/server/classification/addCdeClassification/', err => {
                this.classifyItemModalRef.close();
                if (err) {
                    this.alert.addAlert('danger', err);
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification added.'));
                }
            });
    }

    openClassifyItemModal() {
        this.classifyItemModalRef = this.classifyItemComponent.openModal();
    }

    reloadElt (cb) {
        this.http.get('de/' + this.elt.tinyId).subscribe(res => {
            this.elt = res;
            if (cb) cb();
        }, err => {
            if (err) this.alert.addAlert('danger', 'Error retrieving. ' + err);
            if (cb) cb();
        });
    }

    removeClassif (event) {
        this.classificationSvc.removeClassification(this.elt, event.deleteOrgName,
            event.deleteClassificationArray, '/server/classification/removeCdeClassification/', err => {
                if (err) {
                    this.alert.addAlert('danger', err);
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification removed.'));
                }
            });
    }
}
