import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    Component, Input, Output, OnInit, ViewChild, QueryList, ViewChildren, EventEmitter, TemplateRef
} from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { AlertService } from 'alert/alert.service';

import { TreeComponent } from 'angular-tree-component';
import { classifyItem } from 'core/adminItem/classification';
import _isEqual from 'lodash/isEqual';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { ClassificationClassified, ClassificationHistory, Definition, Designation } from 'shared/models.model';
import { CdeForm } from 'shared/form/form.model';
import { findSteward, removeCategory } from 'shared/system/classificationShared';
import { DeletedNodeEvent } from 'adminItem/public/components/classification/classificationView.component';
import { MatDialogRef } from '@angular/material/dialog';
import { LocalStorageService } from 'non-core/localStorage.service';

@Component({
    selector: 'cde-create-form',
    templateUrl: './createForm.component.html',
    styles: [`
        label {
            font-weight: 700;
        }
    `]
})
export class CreateFormComponent implements OnInit {
    @Input() elt!: CdeForm;
    @Output() done = new EventEmitter();
    @Output() eltChange = new EventEmitter();
    @ViewChild('classifyItemComponent', {static: true}) classifyItemComponent!: ClassifyItemModalComponent;
    @ViewChildren(TreeComponent) classificationView!: QueryList<TreeComponent>;
    dialogRef!: MatDialogRef<TemplateRef<any>>;

    ngOnInit() {
        if (!this.elt) {
            this.elt = new CdeForm();
            this.elt.classification = [];
            this.elt.designations.push(new Designation());
            this.elt.definitions.push(new Definition());
        }
    }

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                private localStorageService: LocalStorageService,
                private location: Location,
                private router: Router, public userService: UserService) {
    }

    afterClassified(event: ClassificationClassified) {
        const postBody = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg
        };
        classifyItem(this.elt, event.selectedOrg, event.classificationArray);
        this.updateClassificationLocalStorage(postBody);
        this.dialogRef.close();
    }

    cancelCreateForm() {
        if (this.done.observers.length > 0) {
            this.done.emit();
        } else {
            this.location.back();
        }
    }

    createForm() {
        this.http.post<CdeForm>('/server/form', this.elt)
            .subscribe(res => {
                    this.router.navigate(['/formView'], {queryParams: {tinyId: res.tinyId}});
                    if (this.done) {
                        this.done.emit();
                    }
                },
                err => this.alert.httpErrorMessageAlert(err));
    }

    confirmDelete(event: DeletedNodeEvent) {
        const steward = findSteward(this.elt, event.deleteOrgName);
        if (!steward) {
            this.alert.addAlert('success', 'No classification to remove.');
            return;
        }
        const err = removeCategory(steward.object, event.deleteClassificationArray);
        if (err) {
            this.alert.addAlert('danger', 'Unexpected error removing classification');
        } else {
            this.alert.addAlert('success', 'Classification removed.');
        }
    }

    openClassifyItemModal() {
        this.dialogRef = this.classifyItemComponent.openModal();
    }

    updateClassificationLocalStorage(item: ClassificationHistory) {
        let recentlyClassification = this.localStorageService.getItem('classificationHistory');
        if (!recentlyClassification) {
            recentlyClassification = [];
        }
        recentlyClassification = recentlyClassification.filter((o: any) => {
            if (o.cdeId) {
                o.eltId = o.cdeId;
            }
            return _isEqual(o, item);
        });
        recentlyClassification.unshift(item);
        this.localStorageService.setItem('classificationHistory', recentlyClassification);
    }

    validationErrors(elt: CdeForm): string {
        if (!elt.designations[0].designation) {
            return 'Please enter a name for the new Form';
        }
        if (!elt.definitions[0].definition) {
            return 'Please enter a definition for the new Form';
        }
        if (!elt.stewardOrg.name) {
            return 'Please select a steward for the new Form';
        }
        if (!elt.classification || elt.classification.length === 0) {
            return 'Please select at least one classification';
        }
        if (!elt.classification.some(classification => classification.stewardOrg.name === elt.stewardOrg.name)) {
            return 'Please select at least one classification owned by ' + elt.stewardOrg.name;
        }
        return '';
    }
}
