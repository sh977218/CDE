import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IActionMapping, TreeComponent } from 'angular-tree-component';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { ClassificationService } from 'core/classification.service';
import { ElasticQueryResponse } from 'core/models.model';
import { SharedService } from 'core/shared.service';

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
    @ViewChild('renameClassificationContent') public renameClassificationContent: NgbModalModule;
    @ViewChild('deleteClassificationContent') public deleteClassificationContent: NgbModalModule;
    @ViewChild('reclassifyComponent') public reclassifyComponent: ClassifyItemModalComponent;
    @ViewChild('addChildClassificationContent') public addChildClassificationContent: NgbModalModule;
    @ViewChild('mapClassificationMeshContent') public mapClassificationMeshContent: NgbModalModule;
    @ViewChild(TreeComponent) private tree: TreeComponent;
    childClassificationNode;
    descriptorID;
    descriptorName;
    descToName = {};
    mapping = {
        flatClassification: '',
        meshDescriptors: []
    };
    meshSearchTerm;
    modalRef: NgbModalRef;
    newClassificationName;
    oldReclassificationArray;
    onInitDone: boolean = false;
    options = {
        idField: 'name',
        childrenField: 'elements',
        displayField: 'name',
        useVirtualScroll: false,
        isExpandedField: 'elements',
        actionMapping: actionMapping
    };
    orgToManage;
    renameClassificationNode;
    searching: boolean = false;
    private searchTerms = new Subject<string>();
    selectedClassificationArray = '';
    selectedClassificationString = '';
    selectedOrg;
    userOrgs;
    userTyped;

    ngOnInit(): void {
        this.userService.then(() => {
            if (this.userService.userOrgs.length > 0) {
                this.orgToManage = this.userService.userOrgs[0];
                this.onChangeOrg(this.orgToManage, () => {
                    this.onInitDone = true;
                });
            } else this.onInitDone = true;
        });

        this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searching = true),
            switchMap(term => {
                let url = (window as any).meshUrl + '/api/search/record?searchInField=termDescriptor&searchType=exactMatch&q=' + term;
                if (term) return this.http.get(url);
                else return Observable.of<string[]>([]);
            })
        ).subscribe((res: ElasticQueryResponse) => {
            if (res && res.hits && res.hits.hits && res.hits.hits.length === 1) {
                let desc = res.hits.hits[0]._source;
                this.descriptorName = desc.DescriptorName.String.t;
                this.descriptorID = desc.DescriptorUI.t;
            }
            this.searching = false;
        }, err => {
            this.descriptorName = '';
            this.descriptorID = '';
            this.alert.addAlert('danger', err);
        });

    }

    constructor(
        private alert: AlertService,
        private classificationSvc: ClassificationService,
        private http: HttpClient,
        public modalService: NgbModal,
        private userService: UserService,
    ) {
    }

    addChildClassification(node) {
        let classificationArray = [];
        if (node) {
            this.selectedClassificationString = node.data.name;
            classificationArray = [node.data.name];
            let _treeNode = node;
            while (_treeNode.parent) {
                _treeNode = _treeNode.parent;
                if (!_treeNode.data.virtual)
                    classificationArray.unshift(_treeNode.data.name);
            }
            classificationArray.forEach((c, i) => {
                if (i < classificationArray.length - 1)
                    this.selectedClassificationArray = this.selectedClassificationArray.concat('<span> ' + c + ' </span> ->');
                else this.selectedClassificationArray = this.selectedClassificationArray.concat(' <strong> ' + c + ' </strong>');
            });
        } else this.selectedClassificationArray = ' <strong> ' + this.selectedOrg.name + ' </strong>';
        classificationArray.push(this.newClassificationName);
        let newClassification = {
            orgName: this.selectedOrg.name,
            categories: classificationArray
        };
        this.classificationSvc.addChildClassification(newClassification, message => {
            this.onChangeOrg(this.selectedOrg.name, () => {
                this.alert.addAlert('success', message);
                this.modalRef.close();
            });
        });
    }

    addMeshDescriptor() {
        this.mapping.meshDescriptors.push(this.descriptorID);
        this.descToName[this.descriptorID] = this.descriptorName;
        this.descriptorID = '';
        this.descriptorName = '';
        this.http.post<any>('/meshClassification', this.mapping).subscribe(
            res => {
                this.alert.addAlert('success', 'Saved');
                this.mapping = res;
            }, err => this.alert.addAlert('danger', 'There was an issue saving this record.'));
    }

    checkJob(type, cb) {
        let indexFn = setInterval(() => {
            this.http.get<any>('/jobStatus/' + type).subscribe(
                res => {
                    if (res.done === true)
                        this.onChangeOrg(this.selectedOrg.name, () => {
                            this.tree.treeModel.update();
                            clearInterval(indexFn);
                            if (cb) cb();
                        });
                });
        }, 5000);
    }

    isOrgAdmin() {
        return SharedService.auth.isOrgAdmin(this.userService.user);
    }

    onChangeOrg(value, cb) {
        if (value) {
            let url = '/org/' + encodeURIComponent(value);
            this.http.get(url).subscribe(
                res => {
                    if (res) this.selectedOrg = res;
                    if (cb) cb();
                }, () => {
                });
        } else {
            if (cb) cb();
        }
    }

    openAddChildClassificationModal(node) {
        this.childClassificationNode = node;
        this.selectedClassificationArray = '';
        this.newClassificationName = '';
        this.modalRef = this.modalService.open(this.addChildClassificationContent);
    }

    openDeleteClassificationModal(node) {
        this.userTyped = '';
        this.selectedClassificationArray = '';
        this.selectedClassificationString = node.data.name;
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1)
                this.selectedClassificationArray = this.selectedClassificationArray.concat('<span> ' + c + ' </span> ->');
            else this.selectedClassificationArray = this.selectedClassificationArray.concat(' <strong> ' + c + ' </strong>');
        });
        this.modalService.open(this.deleteClassificationContent).result.then(result => {
            if (result === 'confirm') {
                let deleteClassification = {
                    orgName: this.selectedOrg.name,
                    categories: classificationArray
                };
                this.classificationSvc.removeOrgClassification(deleteClassification, message => this.alert.addAlert('info', message));
                this.checkJob('deleteClassification', () => this.alert.addAlert('success', 'Classification Deleted'));
            }
        }, () => {
        });
    }

    openMapClassificationMeshModal(node) {
        this.selectedClassificationArray = '';
        this.selectedClassificationString = node.data.name;
        this.newClassificationName = '';
        this.mapping = {
            flatClassification: '',
            meshDescriptors: []
        };
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        this.mapping.flatClassification = [this.selectedOrg.name].concat(classificationArray).join(';');
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1)
                this.selectedClassificationArray = this.selectedClassificationArray.concat('<span> ' + c + ' </span> ->');
            else this.selectedClassificationArray = this.selectedClassificationArray.concat(' <strong> ' + c + ' </strong>');
        });
        this.modalService.open(this.mapClassificationMeshContent)
            .result.then(result => {
            if (result === 'confirm') {
                classificationArray.push(this.newClassificationName);
                let newClassification = {
                    orgName: this.selectedOrg.name,
                    categories: classificationArray
                };
                this.classificationSvc.addChildClassification(newClassification, newOrg => {
                    this.selectedOrg = newOrg;
                    this.alert.addAlert('success', 'Classification Added');
                });
            }
        }, () => {
        });
    }

    openReclassificationModal(node) {
        this.selectedClassificationArray = '';
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1)
                this.selectedClassificationArray = this.selectedClassificationArray.concat(c + ' / ');
            else this.selectedClassificationArray = this.selectedClassificationArray.concat(c);
        });
        this.selectedClassificationArray = 'Classify CDEs in Bulk   <p>Classify all CDEs classified by <strong> ' + this.selectedClassificationArray + ' </strong> with new classification(s).</p>';
        this.oldReclassificationArray = classificationArray;
        this.reclassifyComponent.openModal();
    }

    openRenameClassificationModal(node) {
        this.renameClassificationNode = node;
        this.newClassificationName = node.data.name;
        this.userTyped = '';
        this.selectedClassificationArray = '';
        this.modalRef = this.modalService.open(this.renameClassificationContent);
    }

    reclassify(event) {
        let oldClassification = {
            orgName: this.selectedOrg.name,
            categories: this.oldReclassificationArray
        };
        let newClassification = {
            orgName: event.selectedOrg,
            categories: event.classificationArray
        };
        this.classificationSvc.reclassifyOrgClassification(oldClassification, newClassification, message => this.alert.addAlert('info', message));
        this.checkJob('reclassifyClassification', () => this.alert.addAlert('success', 'Classification Reclassified.'));
    }

    removeDescriptor(i) {
        this.mapping.meshDescriptors.splice(i, 1);
        this.http.post<any>('/meshClassification', this.mapping).subscribe(
            res => {
                this.alert.addAlert('success', 'Saved');
                this.mapping = res;
            }, err => this.alert.addAlert('danger', 'There was an issue saving this record.'));
    };

    renameClassification(node) {
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        let newClassification = {
            orgName: this.selectedOrg.name,
            categories: classificationArray,
            newName: this.newClassificationName
        };
        this.classificationSvc.renameOrgClassification(newClassification, message => this.alert.addAlert('info', message));
        this.checkJob('renameClassification', () => {
            this.alert.addAlert('success', 'Classification Renamed.');
            this.modalRef.close();
        });
    }

    searchByClassification(node, orgName) {
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        return '/cde/search?selectedOrg=' + encodeURIComponent(orgName) +
            '&classification=' + encodeURIComponent(classificationArray.join(';'));
    }

    searchMesh() {
        this.searchTerms.next(this.meshSearchTerm);
    }
}
