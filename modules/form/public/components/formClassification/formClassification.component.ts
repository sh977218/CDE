import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { ClassificationService } from 'core/classification.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { CdeForm } from 'shared/form/form.model';
import { MatDialogRef } from '@angular/material';


@Component({
    selector: 'cde-form-classification',
    templateUrl: './formClassification.component.html'
})
export class FormClassificationComponent {
    @Input() elt: CdeForm;
    @ViewChild('classifyCdesComponent') public classifyCdesComponent: ClassifyItemModalComponent;
    @ViewChild('classifyItemComponent') public classifyItemComponent: ClassifyItemModalComponent;
    classifyCdesModalRef: MatDialogRef<TemplateRef<any>>;
    classifyItemModalRef: MatDialogRef<TemplateRef<any>>;
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

        this.http.post('/server/classification/bulk/tinyId', postBody, {responseType: 'text'})
            .subscribe(res => {
                if (res === 'Done') {
                    this.classifyCdesModalRef.close('success');
                    this.alert.addAlert('success', 'All CDEs Classified.');
                }
                else if (res === 'Processing') {
                    let fn = setInterval(() => {
                        //noinspection TypeScriptValidateTypes
                        this.http.get<any>('/server/classification/bulkClassifyCdeStatus/' + this.elt._id)
                            .subscribe(
                                res => {
                                    this.showProgressBar = true;
                                    this.numberProcessed = res.numberProcessed;
                                    this.numberTotal = res.numberTotal;
                                    if (this.numberProcessed >= this.numberTotal) {
                                        this.http.get('/server/classification/resetBulkClassifyCdesStatus/' + this.elt._id)
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
            '/server/classification/addFormClassification/', (err) => {
                this.classifyItemModalRef.close();
                if (err) this.alert.addAlert('danger', err);
                else this.reloadElt(() => this.alert.addAlert('success', 'Classification added.'));
            });
    }

    getChildren(formElements, ids) {
        if (formElements) {
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
            event.deleteClassificationArray, '/server/classification/removeFormClassification/', err => {
                if (err) {
                    this.alert.addAlert('danger', err);
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification removed.'));
                }
            });
    }
}
