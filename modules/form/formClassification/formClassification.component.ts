import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UserService } from '_app/user.service';
import { DeletedNodeEvent } from 'adminItem/classification/classificationView.component';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { AlertService } from 'alert/alert.service';
import { fetchForm } from 'nativeRender/form.service';
import { ClassificationService } from 'non-core/classification.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { CdeForm, FormElement } from 'shared/form/form.model';
import { Cb, ClassificationClassified, IdVersion, ItemClassification } from 'shared/models.model';
import { canClassify } from 'shared/security/authorizationShared';

@Component({
    selector: 'cde-form-classification',
    templateUrl: './formClassification.component.html',
})
export class FormClassificationComponent {
    @Input() elt!: CdeForm;
    @Output() eltChange = new EventEmitter<CdeForm>();
    @ViewChild('classifyCdesComponent', { static: true })
    public classifyCdesComponent!: ClassifyItemComponent;
    @ViewChild('classifyItemComponent', { static: true })
    public classifyItemComponent!: ClassifyItemComponent;
    canClassify = canClassify;
    showProgressBar = false;

    constructor(
        private alert: AlertService,
        private classificationSvc: ClassificationService,
        public http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService
    ) {}

    classifyAllCdesInForm(event: ClassificationClassified) {
        const allCdeIds: IdVersion[] = [];
        this.getChildren(this.elt.formElements, allCdeIds);

        const postBody: ItemClassification = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg,
            elements: allCdeIds,
        };

        this.http
            .post('/server/classification/bulk/tinyId', postBody, {
                responseType: 'text',
            })
            .subscribe(
                res => {
                    if (res === 'Done') {
                        this.alert.addAlert('success', 'All CDEs Classified.');
                    } else if (res === 'Processing') {
                        const fn = setInterval(() => {
                            //noinspection TypeScriptValidateTypes
                            this.http
                                .get<any>('/server/classification/bulkClassifyCdeStatus/' + this.elt._id)
                                .subscribe(
                                    res => {
                                        this.showProgressBar = true;
                                        if (res.numberProcessed >= res.numberTotal) {
                                            this.http
                                                .get(
                                                    '/server/classification/resetBulkClassifyCdesStatus/' + this.elt._id
                                                )
                                                .subscribe(
                                                    () => {
                                                        //noinspection TypeScriptUnresolvedFunction
                                                        clearInterval(fn);
                                                        this.alert.addAlert('success', 'All CDEs Classified.');
                                                    },
                                                    () => {
                                                        this.alert.addAlert('danger', 'Unexpected error classifying');
                                                    }
                                                );
                                        }
                                    },
                                    () => {
                                        this.alert.addAlert('danger', 'Unexpected error classifying');
                                    }
                                );
                        }, 5000);
                    }
                },
                () => {
                    this.alert.addAlert('danger', 'Unexpected error classifying');
                }
            );
    }

    classifyItem(event: ClassificationClassified) {
        this.classificationSvc.classifyItem(
            this.elt,
            event.selectedOrg,
            event.classificationArray,
            '/server/classification/addFormClassification/',
            err => {
                if (err) {
                    this.alert.addAlert('danger', 'Unexpected error classifying');
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification added.'));
                }
            }
        );
    }

    getChildren(formElements: FormElement[], ids: IdVersion[]) {
        if (formElements) {
            formElements.forEach(formElement => {
                if (formElement.elementType === 'section' || formElement.elementType === 'form') {
                    this.getChildren(formElement.formElements, ids);
                } else if (formElement.elementType === 'question') {
                    ids.push({
                        id: formElement.question.cde.tinyId,
                        version: formElement.question.cde.version,
                    });
                }
            });
        }
    }

    openClassifyItemModal() {
        this.classifyItemComponent.openModal();
    }

    openClassifyCdesModal() {
        this.classifyCdesComponent.openModal();
    }

    reloadElt(cb?: Cb) {
        fetchForm(this.elt.tinyId).then(
            res => {
                this.elt = res;
                this.eltChange.emit(this.elt);
                if (cb) {
                    cb();
                }
            },
            err => {
                if (err) {
                    this.alert.addAlert('danger', 'Error retrieving. ' + err);
                }
                if (cb) {
                    cb();
                }
            }
        );
    }

    removeClassif(event: DeletedNodeEvent) {
        this.classificationSvc.removeClassification(
            this.elt,
            event.deleteOrgName,
            event.deleteClassificationArray,
            '/server/classification/removeFormClassification/',
            err => {
                if (err) {
                    this.alert.addAlert('danger', 'Unexpected error removing classification');
                } else {
                    this.reloadElt(() => this.alert.addAlert('success', 'Classification removed.'));
                }
            }
        );
    }
}
