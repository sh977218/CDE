import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { AlertService } from 'alert/alert.service';
import { ClassificationService } from 'non-core/classification.service';
import { map, tap } from 'rxjs/operators';
import { Organization } from 'shared/organization/organization';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Cb } from 'shared/models.model';
import { ClassificationDatabase } from 'classificationManagement/classification-database';
import { AddChildClassificationDialogComponent } from 'classificationManagement/add-child-classification-dialog/add-child-classification-dialog.component';
import { RenameClassificationDialogComponent } from 'classificationManagement/rename-classification-dialog/rename-classification-dialog.component';
import { ClassifyItemComponent } from 'adminItem/classification/classifyItem.component';
import { DialogData } from 'classificationManagement/dialog-data';
import { FlatClassificationNode } from 'classificationManagement/flat-classification-node';
import { ClassificationNode } from 'classificationManagement/classification-node';
import { SearchQueryParameter } from 'classificationManagement/search-query-parameter';
import { isOrgAdmin } from 'shared/security/authorizationShared';
import { UserService } from '_app/user.service';
import { RemoveOrgClassificationDialogComponent } from 'classificationManagement/remove-org-classification-dialog/remove-org-classification-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { ClassifyItemDialogComponent } from '../../adminItem/classification/classify-item-dialog/classify-item-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
/* mesh API is not available
import { MapMeshClassificationDialogComponent } from '../map-mesh-classification-dialog/map-mesh-classification-dialog.component';
*/

@Component({
    templateUrl: './orgClassificationManagement.component.html',
    styleUrls: ['./orgClassificationManagement.component.scss'],
    imports: [
        MatInputModule,
        MatSelectModule,
        MatTreeModule,
        MatIconModule,
        RouterLink,
        NgIf,
        MatMenuModule,
        ReactiveFormsModule,
        NgForOf,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    providers: [ClassificationDatabase],
    standalone: true,
})
export class OrgClassificationManagementComponent {
    @ViewChild('reclassifyComponent', { static: true })
    reclassifyComponent!: ClassifyItemComponent;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    selectedOrg: UntypedFormControl;
    orgs: Organization[];

    treeControl = new FlatTreeControl<FlatClassificationNode>(
        node => node.level,
        node => node.expandable
    );
    treeFlattener = new MatTreeFlattener(
        this.transformer,
        node => node.level,
        node => node.expandable,
        node => node.elements
    );
    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    isLoadingResults = false;

    constructor(
        private http: HttpClient,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        private alert: AlertService,
        private userService: UserService,
        private classificationSvc: ClassificationService,
        private _database: ClassificationDatabase
    ) {
        this.selectedOrg = new UntypedFormControl(this.activatedRoute.snapshot.queryParams.selectedOrg);
        this.orgs = this.activatedRoute.snapshot.data.orgs;
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
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

    getSearchParam(node: FlatClassificationNode): SearchQueryParameter {
        const path = this.getClassificationPath(node);
        return {
            selectedOrg: this.selectedOrg.value,
            classification: path.categories,
        };
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
        if (this.selectedOrg.value) {
            this.isLoadingResults = true;
            const postBody = {
                orgName: this.selectedOrg.value,
            };
            this.http
                .post<Organization>('/server/classification/updateOrgClassification', postBody)
                .pipe(
                    tap({
                        complete: () => {
                            this.isLoadingResults = false;
                        },
                    }),
                    map(org => {
                        return [
                            {
                                name: org.name,
                                elements: org.classifications,
                            },
                        ];
                    })
                )
                .subscribe(
                    data => {
                        this._database.initialize(data);
                    },
                    () => this.alert.addAlert('danger', 'There was an issue update this org.')
                );
        }
    }

    orgChanged(event: any, cb?: any) {
        this.http
            .get<Organization>('/server/orgManagement/org/' + encodeURIComponent(event.value))
            .pipe(
                map(org => {
                    return [
                        {
                            name: org.name,
                            elements: org.classifications,
                        },
                    ];
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
        this.dialog
            .open(AddChildClassificationDialogComponent, { data })
            .afterClosed()
            .subscribe(newClassificationName => {
                if (newClassificationName) {
                    data.categories.push(newClassificationName);
                    const newClassification = {
                        orgName: data.orgName,
                        categories: data.categories,
                    };
                    this.classificationSvc.addChildClassification(newClassification, message => {
                        if (message) {
                            this.orgChanged({ value: data.orgName });
                            this.alert.addAlert('success', message);
                        }
                    });
                }
            });
    }

    openDeleteClassificationModal(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        this.dialog
            .open(RemoveOrgClassificationDialogComponent, { data })
            .afterClosed()
            .subscribe(
                confirm => {
                    if (confirm) {
                        this.classificationSvc.removeOrgClassification(data, message => {
                            if (message) {
                                this.alert.addAlert('success', message);
                                this.checkJob('deleteClassification', data.orgName, () => {
                                    this.alert.addAlert('success', 'Classification Deleted');
                                });
                            }
                        });
                    }
                },
                () => {}
            );
    }

    openRenameClassificationModal(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        this.dialog
            .open(RenameClassificationDialogComponent, { data })
            .afterClosed()
            .subscribe(newClassificationName => {
                if (newClassificationName) {
                    const newClassification = {
                        orgName: data.orgName,
                        categories: data.categories,
                        newName: newClassificationName,
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
        this.dialog
            .open(ClassifyItemDialogComponent, { data: { title } })
            .afterClosed()
            .subscribe(result => {
                const oldClassification = data;
                const newClassification = {
                    orgName: result.selectedOrg,
                    categories: result.classificationArray,
                };
                this.classificationSvc.reclassifyOrgClassification(
                    oldClassification,
                    newClassification,
                    (message: string) => {
                        this.alert.addAlert('info', message);
                        this.checkJob('reclassifyClassification', result.selectedOrg, () =>
                            this.alert.addAlert('success', 'Classification Reclassified.')
                        );
                    }
                );
            });
    }

    /*  mesh API is not available
    openMapClassificationMeshModal(node: FlatClassificationNode) {
        this.dialog.open(MapMeshClassificationDialogComponent).afterClosed().subscribe();
    }
*/

    checkJob(type: string, orgName: string, cb: Cb) {
        const indexFn = setInterval(() => {
            this.http.get<any>('/server/system/jobStatus/' + type).subscribe(res => {
                if (res.done === true) {
                    this.orgChanged({ value: orgName }, () => {
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
