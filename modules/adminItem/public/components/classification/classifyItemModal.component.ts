import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { TreeNode } from 'angular-tree-component/dist/models/tree-node.model';
import { IActionMapping } from 'angular-tree-component/dist/models/tree-options.model';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { ClassificationService } from 'non-core/classification.service';
import { ClassificationClassified, ClassificationClassifier } from 'shared/models.model';
import { MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from '../../../../non-core/localStorage.service';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        }
    }
};

@Component({
    selector: 'cde-classify-item-modal',
    templateUrl: 'classifyItemModal.component.html',
})
export class ClassifyItemModalComponent {
    @Input() modalTitle = 'Classify this CDE';
    @Output() classified = new EventEmitter<ClassificationClassified>();
    @ViewChild('classifyItemContent', {static: true}) classifyItemContent!: TemplateRef<any>;
    orgClassificationsTreeView: any;
    orgClassificationsRecentlyAddView?: ClassificationClassifier[];
    options = {
        idField: 'name',
        childrenField: 'elements',
        displayField: 'name',
        isExpandedField: 'expanded',
        actionMapping
    };
    selectedOrg?: string;
    treeNode?: TreeNode;

    constructor(private classificationSvc: ClassificationService,
                private http: HttpClient,
                public dialog: MatDialog,
                private localStorageService: LocalStorageService,
                public userService: UserService) {
    }

    classifyItemByRecentlyAdd(classificationRecentlyAdd: ClassificationClassifier) {
        this.classificationSvc.updateClassificationLocalStorage({
            categories: classificationRecentlyAdd.categories,
            orgName: classificationRecentlyAdd.orgName
        });
        this.classified.emit({
            classificationArray: classificationRecentlyAdd.categories,
            selectedOrg: classificationRecentlyAdd.orgName,
        });
    }

    classifyItemByTree(treeNode: TreeNode, selectedOrg: string) {
        this.treeNode = treeNode;
        const classificationArray = [treeNode.data.name];
        let _treeNode = treeNode;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) {
                classificationArray.unshift(_treeNode.data.name);
            }
        }
        this.classificationSvc.updateClassificationLocalStorage({
            categories: classificationArray,
            orgName: this.selectedOrg
        });
        this.classified.emit({
            classificationArray,
            selectedOrg
        });
    }


    onChangeOrg(value: string) {
        if (value) {
            this.http.get('/server/orgManagement/org/' + encodeURIComponent(value)).subscribe(
                org => {
                    this.selectedOrg = value;
                    this.orgClassificationsTreeView = org;
                }, () => {
                    this.orgClassificationsTreeView = {};
                });
        } else {
            this.orgClassificationsTreeView = [];
        }
    }

    openModal() {
        this.orgClassificationsTreeView = null;
        this.orgClassificationsRecentlyAddView = undefined;
        this.orgClassificationsRecentlyAddView = this.localStorageService.getItem('classificationHistory');
        if (this.selectedOrg) {
            this.onChangeOrg(this.selectedOrg);
        } else {
            this.userService.then(() => {
                if (this.userService.userOrgs.length === 1) {
                    this.onChangeOrg(this.userService.userOrgs[0]);
                }
            }, _noop);
        }
        return this.dialog.open(this.classifyItemContent, {width: '800px'});
    }
}
