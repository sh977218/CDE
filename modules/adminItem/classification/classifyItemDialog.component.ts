import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IActionMapping, ITreeOptions, TreeNode } from '@circlon/angular-tree-component';
import { UserService } from '_app/user.service';
import { ClassifyItemDialogData } from 'adminItem/classification/classifyItem.component';
import { ClassificationService } from 'non-core/classification.service';
import { LocalStorageService } from 'non-core/localStorage.service';
import { ClassificationClassified, ClassificationClassifier } from 'shared/models.model';
import { Organization } from 'shared/organization/organization';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {},
    },
};

@Component({
    templateUrl: './classifyItemDialog.component.html',
    styleUrls: ['./classifyItemDialog.component.scss'],
})
export class ClassifyItemDialogComponent {
    orgClassificationsRecentlyAddView?: ClassificationClassifier[];
    orgClassificationsTreeView?: Organization;
    options: ITreeOptions = {
        idField: 'name',
        displayField: 'name',
        childrenField: 'elements',
        hasChildrenField: 'elements',
        isExpandedField: 'expanded',
        actionMapping,
    };
    selectedOrg!: string;
    treeNode?: TreeNode;

    constructor(
        private classificationSvc: ClassificationService,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        public dialogRef: MatDialogRef<ClassifyItemDialogComponent, ClassificationClassified>,
        public userService: UserService,
        @Inject(MAT_DIALOG_DATA) public data: ClassifyItemDialogData
    ) {
        this.orgClassificationsRecentlyAddView = this.localStorageService.getItem('classificationHistory');
        if (this.selectedOrg) {
            this.onChangeOrg(this.selectedOrg);
        } else {
            this.userService.waitForUser().then(() => {
                if (this.userService.userOrgs.length === 1) {
                    this.onChangeOrg(this.userService.userOrgs[0]);
                }
            });
        }
    }

    classifyItemByRecentlyAdd(classificationRecentlyAdd: ClassificationClassifier) {
        this.classificationSvc.updateClassificationLocalStorage({
            categories: classificationRecentlyAdd.categories,
            orgName: classificationRecentlyAdd.orgName,
        });
        this.dialogRef.close({
            classificationArray: classificationRecentlyAdd.categories,
            selectedOrg: classificationRecentlyAdd.orgName,
        });
    }

    classifyItemByTree(treeNode: TreeNode, selectedOrg: string) {
        this.treeNode = treeNode;
        const classificationArray = [treeNode.data.name];
        let node = treeNode;
        while (node.parent) {
            node = node.parent;
            if (!node.data.virtual) {
                classificationArray.unshift(node.data.name);
            }
        }
        this.classificationSvc.updateClassificationLocalStorage({
            categories: classificationArray,
            orgName: this.selectedOrg,
        });
        this.dialogRef.close({
            classificationArray,
            selectedOrg,
        });
    }

    onChangeOrg(value: string) {
        if (value) {
            this.http.get<Organization>('/server/orgManagement/org/' + encodeURIComponent(value)).subscribe(
                org => {
                    this.selectedOrg = value;
                    this.orgClassificationsTreeView = org;
                },
                () => {
                    this.orgClassificationsTreeView = undefined;
                }
            );
        } else {
            this.orgClassificationsTreeView = undefined;
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
