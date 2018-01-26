import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { ClassificationService } from 'core/classification.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { CdeForm } from 'core/form.model';


@Component({
    selector: 'cde-form-classification',
    templateUrl: './formClassification.component.html'
})
export class FormClassificationComponent {
    @Input() elt: CdeForm;
    @ViewChild('classifyCdesComponent') public classifyCdesComponent: ClassifyItemModalComponent;
    @ViewChild('classifyItemComponent') public classifyItemComponent: ClassifyItemModalComponent;
    classifyCdesModalRef: NgbModalRef;
    classifyItemModalRef: NgbModalRef;
    numberProcessed: number;
    numberTotal: number;
    showProgressBar: boolean = false;

    constructor(
        private alert: AlertService,
        private classificationSvc: ClassificationService,
        public http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService,
    ) {
    }

    classifyAllCdesInForm(event) {
        let allCdeIds = [];
        this.getChildren(this.elt.formElements, allCdeIds);

        let postBody = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg,
            elements: allCdeIds
        };

        //noinspection TypeScriptValidateTypes
        this.http.post('/classification/bulk/tinyId', postBody)
            .subscribe(res => {
                if (res['_body'] === 'Done') {
                    this.classifyCdesModalRef.close('success');
                    this.alert.addAlert('success', 'All CDEs Classified.');
                }
                else if (res['_body'] === 'Processing') {
                    let fn = setInterval(() => {
                        //noinspection TypeScriptValidateTypes
                        this.http.get<any>('/bulkClassifyCdeStatus/' + this.elt._id)
                            .subscribe(
                                res => {
                                    this.showProgressBar = true;
                                    this.numberProcessed = res.numberProcessed;
                                    this.numberTotal = res.numberTotal;
                                    if (this.numberProcessed >= this.numberTotal) {
                                        this.http.get('/resetBulkClassifyCdesStatus/' + this.elt._id)
                                            .subscribe(() => {
                                                //noinspection TypeScriptUnresolvedFunction
                                                clearInterval(fn);
                                                this.classifyCdesModalRef.close('success');
                                            }, err => {
                                                this.alert.addAlert('danger', err);
                                            });
                                    }
                                },
                                err => {
                                    this.alert.addAlert('danger', err);
                                    this.classifyCdesModalRef.close('error');
                                });
                    }, 5000);
                }
            }, err => {
                this.alert.addAlert('danger', err);
            });
    }

    classifyItem(event) {
        this.classificationSvc.classifyItem(this.elt, event.selectedOrg, event.classificationArray,
            '/addFormClassification/', (err) => {
                this.classifyItemModalRef.close();
                if (err) this.alert.addAlert('danger', err._body);
                else this.reloadElt(() => this.alert.addAlert('success', 'Classification added.'));
            });
    }

    getChildren(formElements, ids) {
        if (formElements)
            formElements.forEach(formElement => {
                if (formElement.elementType === 'section' || formElement.elementType === 'form') {
                    this.getChildren(formElement.formElements, ids);
                } else if (formElement.elementType === 'question') {
                    ids.push({
                        id: formElement.question.cde.tinyId,
                        version: formElement.question.cde.version
                    });
                }
            });
    }

    openClassifyItemModal() {
        this.classifyItemModalRef = this.classifyItemComponent.openModal();
    }

    openClassifyCdesModal() {
        this.classifyCdesModalRef = this.classifyCdesComponent.openModal();
    }

    reloadElt (cb) {
        this.http.get<CdeForm>('form/' + this.elt.tinyId).subscribe(res => {
            this.elt = res;
            if (cb) cb();
        }, err => {
            if (err) this.alert.addAlert('danger', 'Error retrieving. ' + err);
            if (cb) cb();
        });
    }

    removeClassif (event) {
        this.classificationSvc.removeClassification(this.elt, event.deleteOrgName,
            event.deleteClassificationArray, '/removeFormClassification/', err => {
                if (err) {
                    this.alert.addAlert('danger', err);
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification removed.'));
                }
            });
    }
}
