import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { OrgHelperService } from "core/public/orgHelper.service";
import { Http } from '@angular/http';
import { IActionMapping } from 'angular-tree-component';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
        host > > > .tree {
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
    selectedClassificationArray = [];

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
                @Inject("userResource") private userService) {
    }

    ngOnInit(): void {
        this.userService.getPromise().then(() => {
            if (this.userService.userOrgs.length > 0) {
                this.orgToManage = this.userService.userOrgs[0];
                this.onChangeOrg(this.orgToManage, () => {
                    this.onInitDone = true;
                })
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
        let deleteClassificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                deleteClassificationArray.unshift(_treeNode.data.name);
        }
        this.selectedClassificationArray = deleteClassificationArray;
        this.modalService.open(this.deleteClassificationContent).result.then(result => {
        }, () => {
        });
    }
}