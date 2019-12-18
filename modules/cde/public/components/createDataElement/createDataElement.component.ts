import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
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
import { ClassificationClassified, ClassificationHistory, Definition, Designation } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { findSteward, removeCategory } from 'shared/system/classificationShared';
import { DeletedNodeEvent } from 'adminItem/public/components/classification/classificationView.component';

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
    @Input() elt!: DataElement;
    @Output() close = new EventEmitter<void>();
    @Output() dismiss = new EventEmitter<void>();
    @ViewChild('classifyItemComponent', {static: true}) classifyItemComponent!: ClassifyItemModalComponent;
    dialogRef!: MatDialogRef<TemplateRef<any>>;

    ngOnInit() {
        if (!this.elt) {
            this.elt = new DataElement();
            this.elt.classification = [];
            this.elt.designations.push(new Designation());
            this.elt.definitions.push(new Definition());
        }
    }

    constructor(private alert: AlertService,
                public deCompletionService: DeCompletionService,
                public isAllowedModel: IsAllowedService,
                private http: HttpClient,
                private localStorageService: LocalStorageService,
                private router: Router,
                public userService: UserService) {
    }

    afterClassified(event: ClassificationClassified) {
        classifyItem(this.elt, event.selectedOrg, event.classificationArray);
        this.updateClassificationLocalStorage({
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg
        });
        this.dialogRef.close();
    }

    cancelCreateDataElement() {
        if (this.dismiss.observers.length) {
            this.dismiss.emit();
        } else {
            this.router.navigate(['/']);
        }
    }

    confirmDelete(event: DeletedNodeEvent) {
        const eltCopy = _cloneDeep(this.elt);
        const steward = findSteward(eltCopy, event.deleteOrgName);
        if (!steward || !eltCopy.classification) {
            this.alert.addAlert('success', 'No classification to remove.');
            return;
        }
        const eltCopyClassification = eltCopy.classification;
        const err = removeCategory(steward.object, event.deleteClassificationArray);
        if (err) {
            this.alert.addAlert('danger', 'Unexpected error removing classification');
        } else {
            for (let i = eltCopyClassification.length - 1; i >= 0; i--) {
                if (eltCopyClassification[i].elements.length === 0) {
                    eltCopyClassification.splice(i, 1);
                }
            }
            this.elt = eltCopy;
            this.alert.addAlert('success', 'Classification removed.');
        }
    }

    createDataElement() {
        this.http.post<DataElement>('/server/cde/de', this.elt)
            .subscribe(res => {
                this.close.emit();
                this.router.navigate(['/deView'], {queryParams: {tinyId: res.tinyId}});
            }, err => this.alert.addAlert('danger', 'Unexpected error creating CDE'));
    }

    openClassifyItemModal() {
        this.dialogRef = this.classifyItemComponent.openModal();
    }

    updateClassificationLocalStorage(item: ClassificationHistory) {
        let recentlyClassification = this.localStorageService.get('classificationHistory') as Array<any>;
        if (!recentlyClassification) {
            recentlyClassification = [];
        }
        recentlyClassification = recentlyClassification.filter(o => {
            if (o.cdeId) {
                o.eltId = o.cdeId;
            }
            return _isEqual(o, item);
        });
        recentlyClassification.unshift(item);
        this.localStorageService.set('classificationHistory', recentlyClassification);
    }

    validationErrors(elt: DataElement): string {
        if (!elt.designations[0].designation) {
            return 'Please enter a name for the new CDE';
        } else if (!elt.definitions[0] || !elt.definitions[0].definition) {
            return 'Please enter a definition for the new CDE';
        } else if (!elt.stewardOrg.name || elt.stewardOrg.name === 'Select One') {
            return 'Please select a steward for the new CDE';
        }
        if (elt.classification) {
            if (elt.classification.length) {
                if (!elt.classification.some(oneClassification => oneClassification.stewardOrg.name === elt.stewardOrg.name)) {
                    return 'Please select at least one classification owned by ' + elt.stewardOrg.name;
                }
            } else {
                return 'Please select at least one classification';
            }
        }
        return '';
    }
}
