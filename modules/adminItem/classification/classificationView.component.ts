import { Component, ViewChild, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TreeNode, IActionMapping } from '@circlon/angular-tree-component';
import { UserService } from '_app/user.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Classification, Item } from 'shared/models.model';
import { isSiteAdmin } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';

export interface DeletedNodeEvent {
    deleteClassificationArray: string[];
    deleteOrgName: string;
}

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
    templateUrl: './classificationView.component.html',
})
export class ClassificationViewComponent {
    @Input() elt!: Item;
    @Output() confirmDelete = new EventEmitter<DeletedNodeEvent>();
    @ViewChild('deleteClassificationContent', {static: true}) deleteClassificationContent!: TemplateRef<any>;
    deleteClassificationString?: string;
    orgHelperLoaded = false;

    public options = {
        idField: 'name',
        childrenField: 'elements',
        displayField: 'name',
        useVirtualScroll: false,
        isExpandedField: 'elements',
        actionMapping
    };

    constructor(public dialog: MatDialog,
                public isAllowedModel: IsAllowedService,
                protected userService: UserService,
                private orgHelperService: OrgHelperService) {
        this.orgHelperService.then(() => this.orgHelperLoaded = true, noop);
    }

    getClassifLink() {
        return '/' + this.elt.elementType + '/search';
    }

    openDeleteClassificationModal(node: TreeNode, deleteOrgName: string) {
        this.deleteClassificationString = node.data.name;
        const deleteClassificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) { deleteClassificationArray.unshift(_treeNode.data.name); }
        }
        this.dialog.open(this.deleteClassificationContent).afterClosed().subscribe(result => {
            if (result === 'confirm') {
                this.confirmDelete.emit({
                    deleteClassificationArray,
                    deleteOrgName
                });
            }
        }, () => {});
    }

    searchByClassificationParams(node: TreeNode, orgName: string) {
        const classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) { classificationArray.unshift(_treeNode.data.name); }
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
