import {
    Component,
    Input,
    Output,
    OnInit,
    ViewChild,
    QueryList,
    ViewChildren,
    EventEmitter
} from "@angular/core";
import { Http } from "@angular/http";
import { NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TreeComponent } from "angular-tree-component";
import { LocalStorageService } from "angular-2-local-storage/dist";

import { ClassifyItemModalComponent } from "adminItem/public/components/classification/classifyItemModal.component";
import * as ClassificationShared from "system/shared/classificationShared.js";
import * as _ from "lodash";
import { IsAllowedService } from 'core/public/isAllowed.service';
import { UserService } from 'core/public/user.service';
import { Router } from '@angular/router';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-create-form",
    providers: [NgbActiveModal],
    templateUrl: "./createForm.component.html"
})
export class CreateFormComponent implements OnInit {
    @ViewChild("classifyItemComponent") public classifyItemComponent: ClassifyItemModalComponent;
    @ViewChildren(TreeComponent) public classificationView: QueryList<TreeComponent>;
    @Input() elt;
    @Input() extModalRef: NgbModalRef;
    @Output() eltChange = new EventEmitter();
    modalRef: NgbModalRef;

    constructor(public userService: UserService,
                public isAllowedModel: IsAllowedService,
                private localStorageService: LocalStorageService,
                private http: Http,
                private alert: AlertService,
                private router: Router) {
    }

    ngOnInit(): void {
        if (!this.elt) this.elt = {
            elementType: "form",
            classification: [], stewardOrg: {}, naming: [{
                designation: "", definition: "", tags: []
            }],
            registrationState: {registrationStatus: "Incomplete"}
        };
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
        let eltCopy = _.cloneDeep(this.elt);
        ClassificationShared.classifyItem(eltCopy, event.selectedOrg, event.classificationArray);
        this.updateClassificationLocalStorage(postBody);
        this.elt = eltCopy;
        this.modalRef.close();
    }

    validationErrors(elt) {
        if (!elt.naming[0].designation) {
            return "Please enter a name for the new Form";
        } else if (!elt.naming[0].definition) {
            return "Please enter a definition for the new Form";
        } else if (!elt.stewardOrg.name) {
            return "Please select a steward for the new Form";
        }
        if (elt.classification.length === 0) {
            return "Please select at least one classification";
        } else {
            let found = false;
            for (let i = 0; i < elt.classification.length; i++) {
                if (elt.classification[i].stewardOrg.name === elt.stewardOrg.name) {
                    found = true;
                }
            }
            if (!found) {
                return "Please select at least one classification owned by " + elt.stewardOrg.name;
            }
        }
        return null;
    };

    confirmDelete(event) {
        let eltCopy = _.cloneDeep(this.elt);
        let steward = ClassificationShared.findSteward(eltCopy, event.deleteOrgName);
        ClassificationShared.removeCategory(steward.object, event.deleteClassificationArray, err => {
            if (err) this.alert.addAlert("danger", err);
            else {
                this.elt = eltCopy;
                this.alert.addAlert("success", "Classification removed.");
            }
        });
    };

    updateClassificationLocalStorage(item) {
        let recentlyClassification = <Array<any>>this.localStorageService.get("classificationHistory");
        if (!recentlyClassification) recentlyClassification = [];
        recentlyClassification = recentlyClassification.filter(o => {
            if (o.cdeId) o.eltId = o.cdeId;
            return _.isEqual(o, item);
        });
        recentlyClassification.unshift(item);
        this.localStorageService.set("classificationHistory", recentlyClassification);
    }

    createForm() {
        this.http.post("/form", this.elt).map(res => res.json())
            .subscribe(res => {
                    this.router.navigate(["/formView"], {queryParams: {tinyId: res.tinyId}});
                    if (this.extModalRef) this.extModalRef.close();
                },
                err => {
                    this.alert.addAlert("danger", err);
                });
    }

    cancelCreateForm() {
        if (this.extModalRef) {
            this.extModalRef.close();
        } else {
            this.router.navigate(["/"]);
        }
    }

}
