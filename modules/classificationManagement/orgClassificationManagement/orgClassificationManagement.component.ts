import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { IActionMapping, TreeComponent, TreeNode } from '@circlon/angular-tree-component';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { ClassificationService } from 'non-core/classification.service';
import { Cb, ClassificationClassified, ItemClassificationNew } from 'shared/models.model';
import { Organization } from 'shared/organization/organization';
import { isOrgAdmin } from 'shared/security/authorizationShared';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};

@Component({
    templateUrl: './orgClassificationManagement.component.html',
    styleUrls: ['./orgClassificationManagement.component.scss'],
})
export class OrgClassificationManagementComponent implements OnInit {
    @ViewChild('renameClassificationContent', {static: true}) renameClassificationContent!: TemplateRef<any>;
    @ViewChild('deleteClassificationContent', {static: true}) deleteClassificationContent!: TemplateRef<any>;
    @ViewChild('reclassifyComponent', {static: true}) reclassifyComponent!: ClassifyItemComponent;
    @ViewChild('addChildClassificationContent', {static: true}) addChildClassificationContent!: TemplateRef<any>;
    @ViewChild(TreeComponent) private tree!: TreeComponent;
    childClassificationNode?: TreeNode;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    newClassificationName!: string;
    oldReclassificationArray!: string[];
    onInitDone = false;
    options = {
        idField: 'name',
        childrenField: 'elements',
        displayField: 'name',
        useVirtualScroll: false,
        isExpandedField: 'elements',
        actionMapping
    };
    orgToManage = '';
    renameClassificationNode?: TreeNode;
    selectedClassificationArray = '';
    selectedClassificationString = '';
    selectedOrg!: Organization;
    userTyped = '';

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                private alert: AlertService,
                private classificationSvc: ClassificationService,
                private userService: UserService) {
        this.userService.reload(() => {
            if (this.userService.userOrgs.length > 0) {
                if (this.userService.userOrgs.length === 1) {
                    this.orgToManage = this.userService.userOrgs[0];
                }
                this.orgChanged(this.orgToManage, () => {
                    this.onInitDone = true;
                });
            } else {
                this.onInitDone = true;
            }
        });
    }

    ngOnInit(): void {
    }

    addChildClassification(node: TreeNode) {
        let classificationArray: string[] = [];
        if (node) {
            this.selectedClassificationString = node.data.name;
            classificationArray = [node.data.name];
            let _treeNode = node;
            while (_treeNode.parent) {
                _treeNode = _treeNode.parent;
                if (!_treeNode.data.virtual) {
                    classificationArray.unshift(_treeNode.data.name);
                }
            }
            classificationArray.forEach((c, i) => {
                if (i < classificationArray.length - 1) {
                    this.selectedClassificationArray = this.selectedClassificationArray.concat('<span> ' + c + ' </span> ->');
                } else {
                    this.selectedClassificationArray = this.selectedClassificationArray.concat(' <strong> ' + c + ' </strong>');
                }
            });
        } else {
            this.selectedClassificationArray = ' <strong> ' + this.selectedOrg.name + ' </strong>';
        }
        classificationArray.push(this.newClassificationName);
        const newClassification = {
            orgName: this.selectedOrg.name,
            categories: classificationArray
        };
        this.classificationSvc.addChildClassification(newClassification, (message: string) => {
            this.orgChanged(this.selectedOrg.name, () => {
                this.alert.addAlert('success', message);
                this.dialogRef.close();
            });
        });
    }

    checkJob(type: string, cb: Cb) {
        const indexFn = setInterval(() => {
            this.http.get<any>('/server/system/jobStatus/' + type).subscribe(
                res => {
                    if (res.done === true) {
                        this.orgChanged(this.selectedOrg.name, () => {
                            this.tree.treeModel.update();
                            clearInterval(indexFn);
                            if (cb) {
                                cb();
                            }
                        });
                    }
                });
        }, 5000);
    }

    isOrgAdmin() {
        return isOrgAdmin(this.userService.user);
    }

    orgChanged(value: string, cb?: Cb) {
        if (value) {
            this.http.get<Organization>('/server/orgManagement/org/' + encodeURIComponent(value)).subscribe(
                org => {
                    if (org) {
                        this.selectedOrg = org;
                    }
                    if (cb) {
                        cb();
                    }
                }, () => {
                });
        } else {
            if (cb) {
                cb();
            }
        }
    }

    onChangeOrg(event: MatSelectChange) {
        this.orgChanged(event.value, undefined);
    }

    openAddChildClassificationModal(node?: TreeNode) {
        this.childClassificationNode = node;
        this.selectedClassificationArray = '';
        this.newClassificationName = '';
        this.dialogRef = this.dialog.open(this.addChildClassificationContent);
    }

    openDeleteClassificationModal(node: TreeNode) {
        this.userTyped = '';
        this.selectedClassificationArray = '';
        this.selectedClassificationString = node.data.name;
        const classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) {
                classificationArray.unshift(_treeNode.data.name);
            }
        }
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1) {
                this.selectedClassificationArray = this.selectedClassificationArray.concat('<span> ' + c + ' </span> ->');
            } else {
                this.selectedClassificationArray = this.selectedClassificationArray.concat(' <strong> ' + c + ' </strong>');
            }
        });
        this.dialog.open(this.deleteClassificationContent).afterClosed().subscribe(result => {
            if (result) {
                const deleteClassification = {
                    orgName: this.selectedOrg.name,
                    categories: classificationArray
                };
                this.classificationSvc.removeOrgClassification(deleteClassification,
                    (message: string) => this.alert.addAlert('info', message));
                this.checkJob('deleteClassification', () => this.alert.addAlert('success', 'Classification Deleted'));
            }
        }, () => {
        });
    }

    openReclassificationModal(node: TreeNode) {
        this.selectedClassificationArray = '';
        const classificationArray: string[] = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) {
                classificationArray.unshift(_treeNode.data.name);
            }
        }
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1) {
                this.selectedClassificationArray = this.selectedClassificationArray.concat(c + ' / ');
            } else {
                this.selectedClassificationArray = this.selectedClassificationArray.concat(c);
            }
        });
        this.selectedClassificationArray = 'Classify CDEs in Bulk   <p>Classify all CDEs classified by <strong> ' +
            this.selectedClassificationArray + ' </strong> with new classification(s).</p>';
        this.oldReclassificationArray = classificationArray;
        this.reclassifyComponent.openModal(this.selectedClassificationArray);
    }

    openRenameClassificationModal(node: TreeNode) {
        this.renameClassificationNode = node;
        this.newClassificationName = node.data.name;
        this.userTyped = '';
        this.selectedClassificationArray = '';
        this.dialogRef = this.dialog.open(this.renameClassificationContent);
    }

    reclassify(event: ClassificationClassified) {
        const oldClassification = {
            orgName: this.selectedOrg.name,
            categories: this.oldReclassificationArray
        };
        const newClassification = {
            orgName: event.selectedOrg,
            categories: event.classificationArray
        };
        this.classificationSvc.reclassifyOrgClassification(oldClassification, newClassification, (message: string) =>
            this.alert.addAlert('info', message));
        this.checkJob('reclassifyClassification', () => this.alert.addAlert('success', 'Classification Reclassified.'));
    }

    renameClassification(node: TreeNode) {
        const classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) {
                classificationArray.unshift(_treeNode.data.name);
            }
        }
        const newClassification: ItemClassificationNew = {
            orgName: this.selectedOrg.name,
            categories: classificationArray,
            newName: this.newClassificationName,
        };
        this.classificationSvc.renameOrgClassification(newClassification, (message: string) => this.alert.addAlert('info', message));
        this.checkJob('renameClassification', () => {
            this.alert.addAlert('success', 'Classification Renamed.');
            this.dialogRef.close();
        });
    }

    searchByClassification(node: TreeNode, orgName: string) {
        const classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) {
                classificationArray.unshift(_treeNode.data.name);
            }
        }
        return '/cde/search?selectedOrg=' + encodeURIComponent(orgName) +
            '&classification=' + encodeURIComponent(classificationArray.join(';'));
    }

    updateOrganization() {
        this.http.post<Organization>('/server/classification/updateOrgClassification', {
            orgName: this.orgToManage
        }).subscribe(org => {
                this.selectedOrg = org;
                this.alert.addAlert('success', 'Saved');
            },
            () => this.alert.addAlert('danger', 'There was an issue update this org.'));
    }
}
