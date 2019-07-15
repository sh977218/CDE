import { Component, ViewChild, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserService } from '_app/user.service';
import { IActionMapping } from 'angular-tree-component/dist/models/tree-options.model';
import _noop from 'lodash/noop';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';
import { Classification, Item } from 'shared/models.model';
import { TreeNode } from 'angular-tree-component';

export type DeletedNodeEvent = {
    deleteClassificationArray: string[],
    deleteOrgName: string
};

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};

@Component({
    selector: 'cde-classification-view',
    templateUrl: './classificationView.component.html'
})
export class ClassificationViewComponent {
    @ViewChild('deleteClassificationContent') public deleteClassificationContent!: TemplateRef<any>;
    @Input() elt!: Item;
    @Output() confirmDelete = new EventEmitter<DeletedNodeEvent>();
    deleteClassificationString?: string;
    orgHelperLoaded = false;

    public options = {
        idField: 'name',
        childrenField: 'elements',
        displayField: 'name',
        useVirtualScroll: false,
        isExpandedField: 'elements',
        actionMapping: actionMapping
    };

    constructor(public dialog: MatDialog,
                public isAllowedModel: IsAllowedService,
                protected userService: UserService,
                private orgHelperService: OrgHelperService) {
        this.orgHelperService.then(() => this.orgHelperLoaded = true, _noop);
    }

    getClassifLink() {
        return '/' + this.elt.elementType + '/search';
    }

    openDeleteClassificationModal(node: TreeNode, deleteOrgName: string) {
        this.deleteClassificationString = node.data.name;
        let deleteClassificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) deleteClassificationArray.unshift(_treeNode.data.name);
        }
        this.dialog.open(this.deleteClassificationContent).afterClosed().subscribe(result => {
            if (result === 'confirm') {
                this.confirmDelete.emit({
                    deleteClassificationArray: deleteClassificationArray,
                    deleteOrgName: deleteOrgName
                });
            }
        }, () => {});
    }

    searchByClassificationParams(node: TreeNode, orgName: string) {
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) classificationArray.unshift(_treeNode.data.name);
        }
        return {
            selectedOrg: orgName,
            classification: classificationArray.join(';')
        };
    }

    showWorkingGroups(classification: Classification) {
        return this.orgHelperLoaded ? this.orgHelperService.showWorkingGroup(classification.stewardOrg.name) ||
            isSiteAdmin(this.userService.user) : false;
    }
}
