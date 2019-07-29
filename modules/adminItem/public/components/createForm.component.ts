import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    Component,
    Input,
    Output,
    OnInit,
    ViewChild,
    QueryList,
    ViewChildren,
    EventEmitter, TemplateRef
} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { AlertService } from 'alert/alert.service';
import { LocalStorageService } from 'angular-2-local-storage/dist';
import { TreeComponent } from 'angular-tree-component';
import { classifyItem } from 'core/adminItem/classification';
import _isEqual from 'lodash/isEqual';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { Definition, Designation } from 'shared/models.model';
import { CdeForm } from 'shared/form/form.model';
import { findSteward, removeCategory } from 'shared/system/classificationShared';

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
    @Input() elt: CdeForm;
    @Output() done = new EventEmitter();
    @Output() eltChange = new EventEmitter();
    @ViewChild('classifyItemComponent') public classifyItemComponent: ClassifyItemModalComponent;
    @ViewChildren(TreeComponent) public classificationView: QueryList<TreeComponent>;
    dialogRef: MatDialogRef<TemplateRef<any>>;

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

    cancelCreateForm() {
        if (this.done.observers.length > 0) {
            this.done.emit();
        } else {
            this.location.back();
        }
    }

    createForm() {
        this.http.post<CdeForm>('/form', this.elt)
            .subscribe(res => {
                    this.router.navigate(['/formView'], {queryParams: {tinyId: res.tinyId}});
                    if (this.done) { this.done.emit(); }
                },
                err => this.alert.httpErrorMessageAlert(err));
    }

    confirmDelete(event) {
        const steward = findSteward(this.elt, event.deleteOrgName);
        removeCategory(steward.object, event.deleteClassificationArray, err => {
            if (err) { this.alert.addAlert('danger', 'Unexpected error removing classification'); }
            else { this.alert.addAlert('success', 'Classification removed.'); }
        });
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

    validationErrors(elt): string {
        if (!elt.designations[0].designation) {
            return 'Please enter a name for the new Form';
        }
        if (!elt.definitions[0].definition) {
            return 'Please enter a definition for the new Form';
        }
        if (!elt.stewardOrg.name) {
            return 'Please select a steward for the new Form';
        }
        if (elt.classification.length === 0) {
            return 'Please select at least one classification';
        }
        let found = false;
        for (let i = 0; i < elt.classification.length; i++) {
            if (elt.classification[i].stewardOrg.name === elt.stewardOrg.name) {
                found = true;
            }
        }
        if (!found) {
            return 'Please select at least one classification owned by ' + elt.stewardOrg.name;
        }
        return;
    }
}
