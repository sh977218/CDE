import { Component, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";

import { IsAllowedService } from 'core/isAllowed.service';
import { SharedService } from 'core/shared.service';
import { UserService } from 'core/user.service';
import { OrgHelperService } from 'core/orgHelper.service';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {},
        expanderClick: () => {}
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
                private orgHelper: OrgHelperService) {
    }

    getClassifLink () {
        return '/' + this.elt.elementType + '/search';
    }

    showWorkingGroups = function (stewardClassifications) {
        return this.orgHelper.showWorkingGroup(stewardClassifications.stewardOrg.name, this.userService.user) ||
            SharedService.auth.isSiteAdmin(this.userService.user);
    };


    searchByClassificationParams(node, orgName) {
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        return {
            selectedOrg: orgName,
            classification: classificationArray.join(";")
        };
    }

    openDeleteClassificationModal(node, deleteOrgName) {
        this.deleteClassificationString = node.data.name;
        let deleteClassificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                deleteClassificationArray.unshift(_treeNode.data.name);
        }
        this.modalRef = this.modalService.open(this.deleteClassificationContent);
        this.modalRef.result.then(result => {
            if (result === "confirm") this.confirmDelete.emit({
                deleteClassificationArray: deleteClassificationArray,
                deleteOrgName: deleteOrgName
            });
        }, () => {
        });
    }

}
