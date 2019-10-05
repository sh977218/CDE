import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IActionMapping, TreeComponent, TreeNode } from 'angular-tree-component';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { ClassificationService } from 'non-core/classification.service';
import { Cb, ClassificationClassified, ElasticQueryResponse, Organization } from 'shared/models.model';
import { isOrgAdmin } from 'shared/system/authorizationShared';
import { MatDialog, MatDialogRef, MatSelectChange } from '@angular/material';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};

@Component({
    selector: 'cde-org-classification-management',
    templateUrl: './orgClassificationManagement.component.html'
})
export class OrgClassificationManagementComponent implements OnInit {
    @ViewChild('renameClassificationContent') renameClassificationContent!: TemplateRef<any>;
    @ViewChild('deleteClassificationContent') deleteClassificationContent!: TemplateRef<any>;
    @ViewChild('reclassifyComponent') reclassifyComponent!: ClassifyItemModalComponent;
    @ViewChild('addChildClassificationContent') addChildClassificationContent!: TemplateRef<any>;
    @ViewChild('mapClassificationMeshContent') mapClassificationMeshContent!: TemplateRef<any>;
    @ViewChild(TreeComponent) private tree!: TreeComponent;
    childClassificationNode?: TreeNode;
    descriptorID!: string;
    descriptorName!: string;
    descToName: { [descId: string]: string } = {};
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    mapping!: {
        flatClassification: string,
        meshDescriptors: string[],
    };
    meshSearchTerm = '';
    newClassificationName!: string;
    oldReclassificationArray?: string[];
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
    searching = false;
    private searchTerms = new Subject<string>();
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
        this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => {
                this.searching = true;
                this.descriptorName = '';
                this.descriptorID = '';
            }),
            switchMap(term => {
                const url = (window as any).meshUrl + '/api/search/record?searchInField=termDescriptor&searchType=exactMatch&q=' + term;
                return term ? this.http.get<ElasticQueryResponse>(url) : EmptyObservable.create<ElasticQueryResponse>();
            })
        ).subscribe(res => {
            if (res && res.hits && res.hits.hits && res.hits.hits.length === 1) {
                const desc = res.hits.hits[0]._source;
                this.descriptorName = desc.DescriptorName.String.t;
                this.descriptorID = desc.DescriptorUI.t;
            }
            this.searching = false;
        }, err => {
            this.searching = false;
            this.descriptorName = '';
            this.descriptorID = '';
            this.alert.addAlert('danger', 'Unexpected error getting classification');
        });
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

    addMeshDescriptor() {
        this.mapping.meshDescriptors.push(this.descriptorID);
        this.descToName[this.descriptorID] = this.descriptorName;
        this.descriptorID = '';
        this.descriptorName = '';
        this.http.post<any>('/server/mesh/meshClassification', this.mapping).subscribe(
            res => {
                this.alert.addAlert('success', 'Saved');
                this.mapping = res;
            }, () => this.alert.addAlert('danger', 'There was an issue saving this record.'));
    }

    checkJob(type: string, cb: Cb) {
        const indexFn = setInterval(() => {
            this.http.get<any>('/jobStatus/' + type).subscribe(
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
            this.http.get<Organization>('/server/orgManagement/org/' + value).subscribe(
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

    openMapClassificationMeshModal(node: TreeNode) {
        this.selectedClassificationArray = '';
        this.selectedClassificationString = node.data.name;
        this.newClassificationName = '';
        this.mapping = {
            flatClassification: '',
            meshDescriptors: []
        };
        const classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual) {
                classificationArray.unshift(_treeNode.data.name);
            }
        }
        this.mapping.flatClassification = [this.selectedOrg.name].concat(classificationArray).join(';');
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1) {
                this.selectedClassificationArray = this.selectedClassificationArray.concat('<span> ' + c + ' </span> ->');
            } else {
                this.selectedClassificationArray = this.selectedClassificationArray.concat(' <strong> ' + c + ' </strong>');
            }
        });
        this.dialog.open(this.mapClassificationMeshContent).afterClosed().subscribe(result => {
            if (result) {
                classificationArray.push(this.newClassificationName);
                const newClassification = {
                    orgName: this.selectedOrg.name,
                    categories: classificationArray
                };
                this.classificationSvc.addChildClassification(newClassification, () => {
                    this.alert.addAlert('success', 'Classification Added');
                });
            }
        }, () => {
        });
    }

    openReclassificationModal(node: TreeNode) {
        this.selectedClassificationArray = '';
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
                this.selectedClassificationArray = this.selectedClassificationArray.concat(c + ' / ');
            } else {
                this.selectedClassificationArray = this.selectedClassificationArray.concat(c);
            }
        });
        this.selectedClassificationArray = 'Classify CDEs in Bulk   <p>Classify all CDEs classified by <strong> ' +
            this.selectedClassificationArray + ' </strong> with new classification(s).</p>';
        this.oldReclassificationArray = classificationArray;
        this.reclassifyComponent.openModal();
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
            orgName: this.selectedOrg ? this.selectedOrg.name : undefined,
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

    removeDescriptor(i: number) {
        this.mapping.meshDescriptors.splice(i, 1);
        this.http.post<any>('/server/mesh/meshClassification', this.mapping).subscribe(
            res => {
                this.alert.addAlert('success', 'Saved');
                this.mapping = res;
            }, () => this.alert.addAlert('danger', 'There was an issue saving this record.'));
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
        const newClassification = {
            orgName: this.selectedOrg.name,
            categories: classificationArray,
            newName: this.newClassificationName
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

    searchMesh() {
        this.searchTerms.next(this.meshSearchTerm);
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
