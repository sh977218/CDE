import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { ClassificationService } from 'non-core/classification.service';
import { map } from 'rxjs/operators';
import { Organization } from 'shared/organization/organization';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cb } from 'shared/models.model';
import { ClassificationDatabase } from 'classificationManagement/classification-database';
import {
    AddChildClassificationDialogComponent
} from 'classificationManagement/add-child-classification-dialog/add-child-classification-dialog.component';
import {
    RenameClassificationDialogComponent
} from 'classificationManagement/rename-classification-dialog/rename-classification-dialog.component';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { ClassifyItemDialogComponent } from 'adminItem/classification/classifyItemDialog.component';
import { DialogData } from 'classificationManagement/dialog-data';
import { FlatClassificationNode } from 'classificationManagement/flat-classification-node';
import { ClassificationNode } from 'classificationManagement/classification-node';
import { SearchQueryParameter } from 'classificationManagement/search-query-parameter';
import { isOrgAdmin } from 'shared/security/authorizationShared';
import { UserService } from '_app/user.service';
import {
    RemoveOrgClassificationDialogComponent
} from 'classificationManagement/remove-org-classification-dialog/remove-org-classification-dialog.component';

@Component({
    templateUrl: './orgClassificationManagement.component.html',
    styleUrls: ['./orgClassificationManagement.component.scss'],
})
export class OrgClassificationManagementComponent {
    @ViewChild('reclassifyComponent', {static: true}) reclassifyComponent!: ClassifyItemComponent;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    selectedOrg: FormControl;
    orgs: Organization[];

    treeControl = new FlatTreeControl<FlatClassificationNode>(node => node.level, node => node.expandable);
    treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.elements);
    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    constructor(private http: HttpClient,
                private route: ActivatedRoute,
                private router: Router,
                public dialog: MatDialog,
                private alert: AlertService,
                private userService: UserService,
                private classificationSvc: ClassificationService,
                private _database: ClassificationDatabase) {
        this.selectedOrg = new FormControl(this.route.snapshot.queryParams.selectedOrg)
        this.orgs = this.route.snapshot.data.orgs;
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
            this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<FlatClassificationNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        _database.dataChange.subscribe(data => {
            this.dataSource.data = data;
        });
    }

    isOrgAdmin = () => isOrgAdmin(this.userService.user);

    transformer(node: ClassificationNode, level: number) {
        return {
            expandable: !!node.elements && node.elements.length > 0,
            name: node.name,
            level,
        };
    }

    getLevel = (node: FlatClassificationNode) => node.level;

    isExpandable = (node: FlatClassificationNode) => node.expandable;

    getChildren = (node: ClassificationNode): ClassificationNode[] => node.elements;

    hasChild = (_: number, _nodeData: FlatClassificationNode) => _nodeData.expandable;

    getSearchParam(node: FlatClassificationNode): SearchQueryParameter {
        const path = this.getClassificationPath(node);
        return {
            selectedOrg: this.selectedOrg.value,
            classification: path.categories
        }
    }

    getClassificationPath(node: FlatClassificationNode): DialogData {
        let currentNode: FlatClassificationNode | null = node;
        const path = [];
        do {
            path.unshift(currentNode.name);
            currentNode = this.getParentNode(currentNode);
        } while (currentNode);
        return {
            orgName: path[0],
            categories: path.splice(1),
        };
    }

    /* Get the parent node of a node */
    getParentNode(node: FlatClassificationNode): FlatClassificationNode | null {
        if (!node) {
            return null;
        }
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    updateOrganization() {
        const postBody = {
            orgName: this.selectedOrg.value
        };
        this.http.post<Organization>('/server/classification/updateOrgClassification', postBody)
            .pipe(
                map(org => {
                    return [{
                        name: org.name,
                        elements: org.classifications
                    }]
                })
            )
            .subscribe(data => {
                this._database.initialize(data);
            }, () => this.alert.addAlert('danger', 'There was an issue update this org.'));
    }

    orgChanged(event: any, cb?: any) {
        this.http.get<Organization>('/server/orgManagement/org/' + encodeURIComponent(event.value))
            .pipe(
                map(org => {
                    return [{
                        name: org.name,
                        elements: org.classifications
                    }]
                })
            )
            .subscribe(data => {
                this._database.initialize(data);
                if (cb) {
                    cb();
                }
            });
    }

    openAddChildClassificationModal(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        this.dialog.open(AddChildClassificationDialogComponent, {
            width: '500px',
            data
        }).afterClosed().subscribe(newClassificationName => {
            if (newClassificationName) {
                data.categories.push(newClassificationName);
                const newClassification = {
                    orgName: data.orgName,
                    categories: data.categories
                }
                this.classificationSvc.addChildClassification(newClassification, message => {
                    if (message) {
                        this.orgChanged({value: data.orgName});
                        this.alert.addAlert('success', message);
                    }
                });
            }
        });
    }

    openDeleteClassificationModal(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        this.dialog.open(RemoveOrgClassificationDialogComponent, {
            width: '500px',
            data
        }).afterClosed().subscribe(confirm => {
            if (confirm) {
                this.classificationSvc.removeOrgClassification(data, message => {
                    if (message) {
                        this.alert.addAlert('success', message);
                        this.checkJob('deleteClassification', data.orgName, () => {
                            this.alert.addAlert('success', 'Classification Deleted')
                        });
                    }
                });
            }
        }, () => {
        });
    }

    openRenameClassificationModal(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        this.dialog.open(RenameClassificationDialogComponent, {
            width: '500px',
            data
        }).afterClosed().subscribe(newClassificationName => {
            if (newClassificationName) {
                const newClassification = {
                    orgName: data.orgName,
                    categories: data.categories,
                    newName: newClassificationName
                };
                this.classificationSvc.renameOrgClassification(newClassification, (message: string) => {
                    if (message) {
                        this.alert.addAlert('success', message);
                        this.checkJob('renameClassification', data.orgName, () => {
                            this.alert.addAlert('success', 'Classification Renamed.');
                        });
                    }
                });
            }
        });
    }

    openReclassificationModal(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        const classificationArray = [data.orgName].concat(data.categories).join(' > ');
        const title = `Classify CDEs in Bulk   <p>Classify all CDEs classified by <strong> ${classificationArray} +  </strong> with new classification(s).</p>`;
        this.dialog.open(ClassifyItemDialogComponent, {
            width: '500px',
            data: {title}
        }).afterClosed().subscribe(result => {
            const oldClassification = data;
            const newClassification = {
                orgName: result.selectedOrg,
                categories: result.classificationArray
            };
            this.classificationSvc.reclassifyOrgClassification(oldClassification, newClassification, (message: string) => {
                this.alert.addAlert('info', message);
                this.checkJob('reclassifyClassification', result.selectedOrg, () => this.alert.addAlert('success', 'Classification Reclassified.'));
            });
        })
    }

    checkJob(type: string, orgName: string, cb: Cb) {
        const indexFn = setInterval(() => {
            this.http.get<any>('/server/system/jobStatus/' + type).subscribe(
                res => {
                    if (res.done === true) {
                        this.orgChanged({value: orgName}, () => {
                            clearInterval(indexFn);
                            if (cb) {
                                cb();
                            }
                        });
                    }
                });
        }, 5000);
    }

    getHtmlId(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        if (data.categories.length) {
            return data.categories.join(',');
        } else {
            return data.orgName;
        }
    }

    getAddClassificationRootButtonId() {
        return 'addClassificationUnderRoot';
    }
}
