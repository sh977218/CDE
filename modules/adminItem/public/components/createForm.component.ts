import { HttpClient } from '@angular/common/http';
import {
    Component,
    Input,
    Output,
    OnInit,
    ViewChild,
    QueryList,
    ViewChildren,
    EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageService } from 'angular-2-local-storage/dist';
import { TreeComponent } from 'angular-tree-component';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { IsAllowedService } from 'core/isAllowed.service';
import { Definition, Designation, Naming } from 'shared/models.model';
import { CdeForm } from 'shared/form/form.model';
import { classifyItem, findSteward, removeCategory } from 'shared/system/classificationShared';


@Component({
    selector: 'cde-create-form',
    providers: [NgbActiveModal],
    templateUrl: './createForm.component.html',
    styles: [`
        label {
            font-weight: 700;
        }
    `]
})
export class CreateFormComponent implements OnInit {
    @Input() elt: CdeForm;
    @Input() extModalRef: NgbModalRef;
    @Output() eltChange = new EventEmitter();
    @ViewChild('classifyItemComponent') public classifyItemComponent: ClassifyItemModalComponent;
    @ViewChildren(TreeComponent) public classificationView: QueryList<TreeComponent>;
    modalRef: NgbModalRef;

    ngOnInit() {
        if (!this.elt) {
            this.elt = new CdeForm();
            this.elt.naming.push(new Naming());
            this.elt.designations.push(new Designation());
            this.elt.definitions.push(new Definition());
        }
    }

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                private localStorageService: LocalStorageService,
                private router: Router, public userService: UserService) {
    }

    afterClassified(event) {
        let postBody = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg
        };
        let eltCopy = _cloneDeep(this.elt);
        classifyItem(eltCopy, event.selectedOrg, event.classificationArray);
        this.updateClassificationLocalStorage(postBody);
        this.elt = eltCopy;
        this.modalRef.close();
    }

    cancelCreateForm() {
        if (this.extModalRef) {
            this.extModalRef.close();
        } else {
            this.router.navigate(['/']);
        }
    }

    createForm() {
        this.http.post<CdeForm>('/form', this.elt)
            .subscribe(res => {
                    this.router.navigate(['/formView'], {queryParams: {tinyId: res.tinyId}});
                    if (this.extModalRef) this.extModalRef.close();
                },
                err => this.alert.httpErrorMessageAlert(err));
    }

    confirmDelete(event) {
        let eltCopy = _cloneDeep(this.elt);
        let steward = findSteward(eltCopy, event.deleteOrgName);
        removeCategory(steward.object, event.deleteClassificationArray, err => {
            if (err) this.alert.addAlert('danger', err);
            else {
                this.elt = eltCopy;
                this.alert.addAlert('success', 'Classification removed.');
            }
        });
    }

    openClassifyItemModal() {
        this.modalRef = this.classifyItemComponent.openModal();
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
        if (!elt.designations[0].designation) {
            return 'Please enter a name for the new Form';
        } else if (!elt.definitions[0].definition) {
            return 'Please enter a definition for the new Form';
        } else if (!elt.stewardOrg.name) {
            return 'Please select a steward for the new Form';
        }
        if (elt.classification.length === 0) {
            return 'Please select at least one classification';
        } else {
            let found = false;
            for (let i = 0; i < elt.classification.length; i++) {
                if (elt.classification[i].stewardOrg.name === elt.stewardOrg.name) {
                    found = true;
                }
            }
            if (!found) {
                return 'Please select at least one classification owned by ' + elt.stewardOrg.name;
            }
        }
        return null;
    }
}
