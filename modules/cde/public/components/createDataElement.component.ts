import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageService } from 'angular-2-local-storage/dist';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';

import { AlertService } from '_app/alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { DataElement } from 'core/dataElement.model';
import { IsAllowedService } from 'core/isAllowed.service';
import { SharedService } from 'core/shared.service';


@Component({
    selector: 'cde-create-data-element',
    templateUrl: './createDataElement.component.html',
    styles: [`
        label {
            font-weight: 700;
        }
    `]
})
export class CreateDataElementComponent implements OnInit {
    @Input() elt;
    @Output() close = new EventEmitter<void>();
    @Output() dismiss = new EventEmitter<void>();
    @ViewChild('classifyItemComponent') public classifyItemComponent: ClassifyItemModalComponent;
    modalRef: NgbModalRef;
    suggestedCdes: any[] = [];
    validationMessage;

    ngOnInit() {
        if (!this.elt)
            this.elt = {
                elementType: 'cde',
                classification: [], stewardOrg: {}, naming: [{
                    designation: '', definition: '', tags: []
                }],
                registrationState: {registrationStatus: 'Incomplete'}
            };
        this.validationErrors(this.elt);
    }

    constructor(
        private alert: AlertService,
        private elasticService: ElasticService,
        public isAllowedModel: IsAllowedService,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private router: Router,
        public userService: UserService,
    ) {
    }

    afterClassified(event) {
        let postBody = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg
        };
        let eltCopy = _cloneDeep(this.elt);
        SharedService.classificationShared.classifyItem(eltCopy, event.selectedOrg, event.classificationArray);
        this.updateClassificationLocalStorage(postBody);
        this.elt = eltCopy;
        this.modalRef.close();
    }

    cancelCreateDataElement() {
        if (this.dismiss.observers.length)
            this.dismiss.emit();
        else
            this.router.navigate(['/']);
    }

    confirmDelete(event) {
        let eltCopy = _cloneDeep(this.elt);
        let steward = SharedService.classificationShared.findSteward(eltCopy, event.deleteOrgName);
        SharedService.classificationShared.removeCategory(steward.object, event.deleteClassificationArray, err => {
            if (err) this.alert.addAlert('danger', err);
            else {
                for (let i = eltCopy.classification.length - 1; i >= 0; i--) {
                    if (eltCopy.classification[i].elements.length === 0) {
                        eltCopy.classification.splice(i, 1);
                    }
                }
                this.elt = eltCopy;
                this.alert.addAlert('success', 'Classification removed.');
            }
        });
    }

    createDataElement() {
        this.http.post<DataElement>('/de', this.elt)
            .subscribe(res => {
                this.close.emit();
                this.router.navigate(['/deView'], {queryParams: {tinyId: res.tinyId}});
            }, err => this.alert.addAlert('danger', err));
    }

    elementNameChanged() {
        if (!(this.elt.naming[0].designation) || this.elt.naming[0].designation.length < 3) return;
        else this.showSuggestions(this.elt.naming[0].designation);
    }

    openClassifyItemModal() {
        this.modalRef = this.classifyItemComponent.openModal();
    }

    showSuggestions(event) {
        if (event.length < 3) return;
        let searchSettings = {
            q: ''
            , page: 1
            , classification: []
            , classificationAlt: []
            , regStatuses: []
            , resultPerPage: 20
        };
        searchSettings.q = event.trim();
        this.elasticService.generalSearchQuery(
            this.elasticService.buildElasticQuerySettings(searchSettings), 'cde', (err, result) => {
                if (err) return;
                this.suggestedCdes = result.cdes;
                this.suggestedCdes.forEach(cde => {
                    cde.getEltUrl = function () {
                        return '/deView?tinyId=' + this.tinyId;
                    };
                    cde.getLabel = function () {
                        if (this.primaryNameCopy)
                            return this.primaryNameCopy;
                        else return this.naming[0].designation;
                    };
                });
            });
    }

    updateClassificationLocalStorage(item) {
        let recentlyClassification = <Array<any>>this.localStorageService.get('classificationHistory');
        if (!recentlyClassification) recentlyClassification = [];
        recentlyClassification = recentlyClassification.filter(o => {
            if (o.cdeId) o.eltId = o.cdeId;
            return _isEqual(o, item);
        });
        recentlyClassification.unshift(item);
        this.localStorageService.set('classificationHistory', recentlyClassification);
    }

    validationErrors(elt) {
        if (!elt.naming[0].designation) {
            this.validationMessage = 'Please enter a name for the new CDE';
            return true;
        } else if (!elt.naming[0].definition) {
            this.validationMessage = 'Please enter a definition for the new CDE';
            return true;
        } else if (!elt.stewardOrg.name || elt.stewardOrg.name === 'Select One') {
            this.validationMessage = 'Please select a steward for the new CDE';
            return true;
        }
        if (elt.classification.length === 0) {
            this.validationMessage = 'Please select at least one classification';
            return true;
        } else {
            let found = false;
            for (let i = 0; i < elt.classification.length; i++) {
                if (elt.classification[i].stewardOrg.name === elt.stewardOrg.name) {
                    found = true;
                }
            }
            if (!found) {
                this.validationMessage = 'Please select at least one classification owned by ' + elt.stewardOrg.name;
                return true;
            }
        }
        this.validationMessage = null;
        return false;
    }
}
