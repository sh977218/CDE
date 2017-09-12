import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { OrgHelperService } from "core/public/orgHelper.service";
import { Http } from '@angular/http';
import { IActionMapping } from 'angular-tree-component';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ClassificationService } from "core/public/core.module";
import { AlertService } from 'system/public/components/alert/alert.service';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};

@Component({
    selector: "cde-org-classification-management",
    templateUrl: "./orgClassificationManagement.component.html",
    styles: [`
        host >>> .tree {
            cursor: default !important;
        }
    `]
})
export class OrgClassificationManagementComponent implements OnInit {
    @ViewChild("deleteClassificationContent") public deleteClassificationContent: NgbModalModule;
    public modalRef: NgbModalRef;
    onInitDone: boolean = false;
    orgToManage;
    userOrgs;
    selectedOrg;
    selectedClassificationArray = "";
    selectedClassificationString = "";
    userTyped;

    public options = {
        idField: "name",
        childrenField: "elements",
        displayField: "name",
        useVirtualScroll: false,
        isExpandedField: "elements",
        actionMapping: actionMapping
    };

    constructor(private http: Http,
                public modalService: NgbModal,
                private orgHelperService: OrgHelperService,
                private alert: AlertService,
                @Inject("userResource") private userService,
                private classificationSvc: ClassificationService) {
    }

    ngOnInit(): void {
        this.userService.getPromise().then(() => {
            if (this.userService.userOrgs.length > 0) {
                this.orgToManage = this.userService.userOrgs[0];
                this.onChangeOrg(this.orgToManage, () => {
                    this.onInitDone = true;
                });
            } else this.onInitDone = true;
        });

    }

    onChangeOrg(value, cb) {
        if (value) {
            let url = "/org/" + encodeURIComponent(value);
            this.http.get(url).map(res => res.json()).subscribe(
                res => {
                    if (res) this.selectedOrg = res;
                    if (cb) cb();
                }, () => {
                });
        } else {
            if (cb) cb();
        }
    }


    openDeleteClassificationModal(node) {
        this.userTyped = "";
        this.selectedClassificationArray = "";
        this.selectedClassificationString = node.data.name;
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1)
                this.selectedClassificationArray = this.selectedClassificationArray.concat("<span> " + c + " </span> ->");
            else this.selectedClassificationArray = this.selectedClassificationArray.concat(" <strong> " + c + " </strong>");
        });
        this.modalService.open(this.deleteClassificationContent).result.then(result => {
            this.classificationSvc.removeOrgClassification(this.selectedOrg.name, classificationArray, newOrg => {
                this.selectedOrg = newOrg;
                this.alert.addAlert("success", "Classification Deleted");
            });
        }, () => {
        });
    }
}