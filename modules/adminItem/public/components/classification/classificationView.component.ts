import { Component, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};

@Component({
    selector: "cde-classification-view",
    providers: [NgbActiveModal],
    templateUrl: "./classificationView.component.html"
})
export class ClassificationViewComponent {
    @ViewChild("deleteClassificationContent") public deleteClassificationContent: NgbModalModule;
    @Input() elt;
    @Output() confirmDelete = new EventEmitter();
    public modalRef: NgbModalRef;
    deleteClassificationString;
    orgHelperLoaded = false;

    public options = {
        idField: "name",
        childrenField: "elements",
        displayField: "name",
        useVirtualScroll: false,
        isExpandedField: "elements",
        actionMapping: actionMapping
    };

    constructor(public modalService: NgbModal,
                public isAllowedModel: IsAllowedService,
                protected userService: UserService,
                private orgHelperService: OrgHelperService) {
        this.orgHelperService.then(() => this.orgHelperLoaded = true, _noop);
    }

    getClassifLink() {
        return '/' + this.elt.elementType + '/search';
    }

    openDeleteClassificationModal(node, deleteOrgName) {
        this.deleteClassificationString = node.data.name;
        let deleteClassificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) deleteClassificationArray.unshift(_treeNode.data.name);
        }
        this.modalRef = this.modalService.open(this.deleteClassificationContent);
        this.modalRef.result.then(result => {
            if (result === "confirm") {
                this.confirmDelete.emit({
                    deleteClassificationArray: deleteClassificationArray,
                    deleteOrgName: deleteOrgName
                });
            }
        }, () => {
        });
    }

    searchByClassificationParams(node, orgName) {
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) classificationArray.unshift(_treeNode.data.name);
        }
        return {
            selectedOrg: orgName,
            classification: classificationArray.join(";")
        };
    }

    showWorkingGroups(stewardClassifications) {
        return this.orgHelperLoaded ? this.orgHelperService.showWorkingGroup(stewardClassifications.stewardOrg.name) ||
            isSiteAdmin(this.userService.user) : false;
    }
}
