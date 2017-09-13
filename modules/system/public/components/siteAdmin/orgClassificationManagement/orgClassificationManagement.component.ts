import { Component, OnInit, Inject, ViewChild, Injectable } from "@angular/core";
import { Http, Jsonp } from '@angular/http';
import { IActionMapping } from 'angular-tree-component';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

import { ClassificationService } from "core/public/core.module";
import { AlertService } from 'system/public/components/alert/alert.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { Subject } from 'rxjs/Subject';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};

@Component({
    selector: "cde-org-classification-management",
    templateUrl: "./orgClassificationManagement.component.html",
    styles: [`
        host > > > .tree {
            cursor: default !important;
        }
    `]
})
export class OrgClassificationManagementComponent implements OnInit {
    @ViewChild("renameClassificationContent") public renameClassificationContent: NgbModalModule;
    @ViewChild("deleteClassificationContent") public deleteClassificationContent: NgbModalModule;
    @ViewChild("reclassifyComponent") public reclassifyComponent: ClassifyItemModalComponent;
    @ViewChild("addChildClassificationContent") public addChildClassificationContent: NgbModalModule;
    @ViewChild("mapClassificationMeshContent") public mapClassificationMeshContent: NgbModalModule;
    public modalRef: NgbModalRef;
    onInitDone: boolean = false;
    orgToManage;
    userOrgs;
    selectedOrg;
    selectedClassificationArray = "";
    selectedClassificationString = "";
    userTyped;
    newClassificationName;
    meshSearchTerm;
    searching: boolean = false;
    searchFailed: boolean = false;
    meshDescriptors = [];
    oldReclassificationArray;
    private searchTerms = new Subject<string>();

    public options = {
        idField: "name",
        childrenField: "elements",
        displayField: "name",
        useVirtualScroll: false,
        isExpandedField: "elements",
        actionMapping: actionMapping
    };

    constructor(private http: Http,
                public modalService: NgbModal,
                private alert: AlertService,
                @Inject("userResource") private userService,
                private classificationSvc: ClassificationService) {
    }

    ngOnInit(): void {
        this.userService.getPromise().then(() => {
            if (this.userService.userOrgs.length > 0) {
                this.orgToManage = this.userService.userOrgs[0];
                this.onChangeOrg(this.orgToManage, () => {
                    this.onInitDone = true;
                });
            } else this.onInitDone = true;
        });

        this.searchTerms
            .debounceTime(300)
            .distinctUntilChanged()
            .do(() => this.searching = true)
            .switchMap(term => {
                let url = (window as any).meshUrl + "/api/search/record?searchInField=termDescriptor&searchType=exactMatch&q=" + term;
                if (term) return this.http.get(url).map(res => res.json());
                else return Observable.of<string[]>([]);
            }).subscribe(res => {
            if (res && res.hits && res.hits.hits && res.hits.hits.length === 1) {
                let desc = res.data.hits.hits[0]._source;
                let descriptorName = desc.DescriptorName.String.t;
                let descriptorID = desc.DescriptorUI.t;
                this.meshDescriptors.push({descriptorName: descriptorName, descriptorID: descriptorID});
            }
            this.searching = false;
        });

    }

    onChangeOrg(value, cb) {
        if (value) {
            let url = "/org/" + encodeURIComponent(value);
            this.http.get(url).map(res => res.json()).subscribe(
                res => {
                    if (res) this.selectedOrg = res;
                    if (cb) cb();
                }, () => {
                });
        } else {
            if (cb) cb();
        }
    }

    openRenameClassificationModal(node) {
        this.userTyped = "";
        this.selectedClassificationArray = "";
        this.newClassificationName = node.data.name;
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        this.modalService.open(this.renameClassificationContent)
            .result.then(result => {
            if (result === "confirm")
                this.classificationSvc.renameOrgClassification(this.selectedOrg.name, classificationArray, this.newClassificationName, newOrg => {
                    this.selectedOrg = newOrg;
                    this.alert.addAlert("success", "Renaming complete.");
                });
        }, () => {
        });
    }

    openDeleteClassificationModal(node) {
        this.userTyped = "";
        this.selectedClassificationArray = "";
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
                this.selectedClassificationArray = this.selectedClassificationArray.concat("<span> " + c + " </span> ->");
            else this.selectedClassificationArray = this.selectedClassificationArray.concat(" <strong> " + c + " </strong>");
        });
        this.modalService.open(this.deleteClassificationContent)
            .result.then(result => {
            if (result === "confirm")
                this.classificationSvc.removeOrgClassification(this.selectedOrg.name, classificationArray, newOrg => {
                    this.selectedOrg = newOrg;
                    this.alert.addAlert("success", "Classification Deleted");
                });
        }, () => {
        });
    }

    openReclassificationModal(node) {
        this.selectedClassificationArray = "";
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1)
                this.selectedClassificationArray = this.selectedClassificationArray.concat(c + " / ");
            else this.selectedClassificationArray = this.selectedClassificationArray.concat(c);
        });
        this.selectedClassificationArray = "Classify CDEs in Bulk   <p>Classify all CDEs classified by <strong> " + this.selectedClassificationArray + " </strong> with new classification(s).</p>";
        this.oldReclassificationArray = classificationArray;
        this.reclassifyComponent.openModal();
    }

    reclassify(event) {
        let oldClassification = {
            orgName: this.selectedOrg.name,
            classifications: this.oldReclassificationArray
        };
        let newClassification = {
            categories: event.classificationArray,
            cdeId: null,
            orgName: event.selectedOrg
        };
        this.classificationSvc.reclassifyOrgClassification(oldClassification, newClassification, newOrg => {
            this.selectedOrg = newOrg;
            this.alert.addAlert("success", "Elements classified.");
        });
    }

    openAddChildClassificationModal(node) {
        this.selectedClassificationArray = "";
        this.selectedClassificationString = node.data.name;
        this.newClassificationName = "";
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1)
                this.selectedClassificationArray = this.selectedClassificationArray.concat("<span> " + c + " </span> ->");
            else this.selectedClassificationArray = this.selectedClassificationArray.concat(" <strong> " + c + " </strong>");
        });
        this.modalService.open(this.addChildClassificationContent)
            .result.then(result => {
            if (result === "confirm") {
                classificationArray.push(this.newClassificationName);
                this.classificationSvc.addChildClassification(this.selectedOrg.name, classificationArray, newOrg => {
                    this.selectedOrg = newOrg;
                    this.alert.addAlert("success", "Classification Added");
                });
            }
        }, () => {
        });
    }

    openMapClassificationMeshModal(node) {
        this.selectedClassificationArray = "";
        this.selectedClassificationString = node.data.name;
        this.newClassificationName = "";
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        classificationArray.forEach((c, i) => {
            if (i < classificationArray.length - 1)
                this.selectedClassificationArray = this.selectedClassificationArray.concat("<span> " + c + " </span> ->");
            else this.selectedClassificationArray = this.selectedClassificationArray.concat(" <strong> " + c + " </strong>");
        });
        this.modalService.open(this.mapClassificationMeshContent)
            .result.then(result => {
            if (result === "confirm") {
                classificationArray.push(this.newClassificationName);
                this.classificationSvc.addChildClassification(this.selectedOrg.name, classificationArray, newOrg => {
                    this.selectedOrg = newOrg;
                    this.alert.addAlert("success", "Classification Added");
                });
            }
        }, () => {
        });
    }

    searchMesh() {
        this.searchTerms.next(this.meshSearchTerm);
    }

    /*
        addMeshDescriptor = function () {
            $scope.mapping.meshDescriptors.push($scope.descriptorID);
            $scope.descToName[$scope.descriptorID] = $scope.descriptorName;
            delete $scope.descriptorID;
            delete $scope.descriptorName;

            $http.post("/meshClassification", $scope.mapping).then(function onSuccess(response) {
                Alert.addAlert("success", "Saved");
                $scope.mapping = response.data;
            }).catch(function onError() {
                Alert.addAlert("danger", "There was an issue saving this record.");
            });
        };

        removeDescriptor = function (i) {
            $scope.mapping.meshDescriptors.splice(i, 1);
            $http.post("/meshClassification", $scope.mapping).then(function onSuccess(response) {
                Alert.addAlert("success", "Saved");
                $scope.mapping = response.data;
            }).catch(function onError() {
                Alert.addAlert("danger", "There was an issue saving this record.");
            });
        };


        isDescriptorAlreadyMapped = function (desc) {
            return $scope.mapping.meshDescriptors.indexOf(desc) > -1;
        };
    */

}