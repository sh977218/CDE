import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageService } from 'angular-2-local-storage/dist';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';

import { AlertService } from '_app/alert/alert.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { ElasticService } from '_app/elastic.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { SharedService } from 'core/shared.service';
import { UserService } from '_app/user.service';
import { CdeForm } from '../../../core/form.model';
import { SearchSettings } from '../../../search/search.model';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


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
    private _elt: CdeForm = new CdeForm();

    @Input() set elt(e: CdeForm) {
        this._elt = e;
        this.validationErrors(this.elt);
    };

    get elt() {
        return this._elt;
    }

    @Output() close = new EventEmitter<void>();
    @Output() dismiss = new EventEmitter<void>();
    @ViewChild('classifyItemComponent') public classifyItemComponent: ClassifyItemModalComponent;

    modalRef: NgbModalRef;
    validationMessage;
    searchSettings = new SearchSettings;
    private searchTerms = new Subject<string>();
    suggestedCdes = [];

    constructor(public userService: UserService,
                public isAllowedModel: IsAllowedService,
                private localStorageService: LocalStorageService,
                private elasticService: ElasticService,
                private http: Http,
                private alert: AlertService,
                private router: Router) {
    }

    ngOnInit(): void {

        let settings = this.elasticService.buildElasticQuerySettings(this.searchSettings);
        this.searchTerms.debounceTime(300).distinctUntilChanged().switchMap(term => {
            if (term) {
                settings.resultPerPage = 5;
                settings.searchTerm = term;
                return this.http.post('/cdeCompletion/' + encodeURI(term), this.elasticService.buildElasticQuerySettings(settings)).map(res => res.json());
            }
            else return Observable.of<string[]>([]);
        }).subscribe(res => {
            let tinyIdList = res.map(r => r._id).slice(0, 5);
            if (tinyIdList && tinyIdList.length > 0)
                this.http.get('/deList/' + tinyIdList).map(res => res.json()).subscribe(result => {
                    this.suggestedCdes = result;
                }, err => this.alert.addAlert('danger', err));
            else this.suggestedCdes = [];
        });
    }

    dataElementNameChanged() {
        this.searchTerms.next(this._elt.naming[0].designation);
    }

    openClassifyItemModal() {
        this.modalRef = this.classifyItemComponent.openModal();
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
    };

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

    createDataElement() {
        this.http.post('/de', this.elt).map(res => res.json())
            .subscribe(res => {
                this.close.emit();
                this.router.navigate(['/deView'], {queryParams: {tinyId: res.tinyId}});
            }, err => this.alert.addAlert('danger', err));
    }

    cancelCreateDataElement() {
        if (this.dismiss.observers.length) this.dismiss.emit();
        else this.router.navigate(['/']);
    }
}
