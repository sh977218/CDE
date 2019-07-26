import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { AlertService } from 'alert/alert.service';
import { LocalStorageService } from 'angular-2-local-storage/dist';
import { DeCompletionService } from 'cde/public/components/completion/deCompletion.service';
import { classifyItem } from 'core/adminItem/classification';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { Definition, Designation } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { findSteward, removeCategory } from 'shared/system/classificationShared';

@Component({
    selector: 'cde-create-data-element',
    templateUrl: './createDataElement.component.html',
    providers: [DeCompletionService],
    styles: [`
        label {
            font-weight: 700;
        }
    `]
})
export class CreateDataElementComponent implements OnInit {
    @Input() elt: DataElement;
    @Output() close = new EventEmitter<void>();
    @Output() dismiss = new EventEmitter<void>();
    @ViewChild('classifyItemComponent') public classifyItemComponent: ClassifyItemModalComponent;
    dialogRef: MatDialogRef<TemplateRef<any>>;
    validationMessage;

    ngOnInit() {
        if (!this.elt) {
            this.elt = new DataElement();
            this.elt.classification = [];
            this.elt.designations.push(new Designation());
            this.elt.definitions.push(new Definition());
        }
        this.validationErrors(this.elt);
    }

    constructor(private alert: AlertService,
                public deCompletionService: DeCompletionService,
                public isAllowedModel: IsAllowedService,
                private http: HttpClient,
                private localStorageService: LocalStorageService,
                private router: Router,
                public userService: UserService) {
    }

    afterClassified(event) {
        const postBody = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg
        };
        classifyItem(this.elt, event.selectedOrg, event.classificationArray);
        this.updateClassificationLocalStorage(postBody);
        this.dialogRef.close();
    }

    cancelCreateDataElement() {
        if (this.dismiss.observers.length) { this.dismiss.emit(); }
        else { this.router.navigate(['/']); }
    }

    confirmDelete(event) {
        const eltCopy = _cloneDeep(this.elt);
        const steward = findSteward(eltCopy, event.deleteOrgName);
        removeCategory(steward.object, event.deleteClassificationArray, err => {
            if (err) { this.alert.addAlert('danger', 'Unexpected error removing classification'); }
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
            }, err => this.alert.addAlert('danger', 'Unexpected error creating CDE'));
    }

    openClassifyItemModal() {
        this.dialogRef = this.classifyItemComponent.openModal();
    }

    updateClassificationLocalStorage(item) {
        let recentlyClassification = this.localStorageService.get('classificationHistory') as Array<any>;
        if (!recentlyClassification) { recentlyClassification = []; }
        recentlyClassification = recentlyClassification.filter(o => {
            if (o.cdeId) { o.eltId = o.cdeId; }
            return _isEqual(o, item);
        });
        recentlyClassification.unshift(item);
        this.localStorageService.set('classificationHistory', recentlyClassification);
    }

    validationErrors(elt) {
        if (!elt.designations[0].designation) {
            this.validationMessage = 'Please enter a name for the new CDE';
            return true;
        } else if (!elt.definitions[0] || !elt.definitions[0].definition) {
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
