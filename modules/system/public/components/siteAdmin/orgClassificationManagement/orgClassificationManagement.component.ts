import { Component, OnInit, Inject, ViewChild, Injectable } from "@angular/core";
import { Http, Jsonp } from '@angular/http';
import { IActionMapping, TreeComponent } from 'angular-tree-component';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

import { ClassificationService } from "core/public/core.module";
import { AlertService } from 'system/public/components/alert/alert.service';
import { ClassifyItemModalComponent } from 'adminItem/public/components/classification/classifyItemModal.component';
import { Subject } from 'rxjs/Subject';
import * as authShared from "system/shared/authorizationShared";

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

    @ViewChild(TreeComponent) private tree: TreeComponent;

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
    oldReclassificationArray;
    private searchTerms = new Subject<string>();

    descriptorName;
    descriptorID;
    descToName = {};
    mapping = {
        flatClassification: "",
        meshDescriptors: []
    };
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
                let desc = res.hits.hits[0]._source;
                this.descriptorName = desc.DescriptorName.String.t;
                this.descriptorID = desc.DescriptorUI.t;
            }
            this.searching = false;
        }, err => {
            this.descriptorName = "";
            this.descriptorID = "";
            this.alert.addAlert("danger", err);
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

    isOrgAdmin() {
        return authShared.isOrgAdmin(this.userService.user);
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
            if (result === "confirm") {
                this.classificationSvc.renameOrgClassification(this.selectedOrg.name, classificationArray, this.newClassificationName, message => this.alert.addAlert("info", message));
                this.checkJob("renameClassification", () => this.alert.addAlert("success", "Classification Renamed"))
            }
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
        this.modalService.open(this.deleteClassificationContent).result.then(result => {
            if (result === "confirm") {
                this.classificationSvc.removeOrgClassification(this.selectedOrg.name, classificationArray, message => this.alert.addAlert("info", message));
                this.checkJob("deleteClassification", () => this.alert.addAlert("success", "Classification Deleted"))
            }
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
        this.classificationSvc.reclassifyOrgClassification(event.selectedOrg, this.oldReclassificationArray, event.classificationArray, newOrg => {
            this.selectedOrg = newOrg;
            this.alert.addAlert("success", "Elements classified.");
        });
    }

    openAddChildClassificationModal(node) {
        this.selectedClassificationArray = "";
        this.newClassificationName = "";
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
                    this.selectedClassificationArray = this.selectedClassificationArray.concat("<span> " + c + " </span> ->");
                else this.selectedClassificationArray = this.selectedClassificationArray.concat(" <strong> " + c + " </strong>");
            });
        } else this.selectedClassificationArray = " <strong> " + this.selectedOrg.name + " </strong>";
        this.modalService.open(this.addChildClassificationContent).result.then(result => {
            if (result === "confirm") {
                classificationArray.push(this.newClassificationName);
                this.classificationSvc.addChildClassification(this.selectedOrg.name, classificationArray, message => {
                    this.onChangeOrg(this.selectedOrg.name, () => this.alert.addAlert("success", message));
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
        this.mapping.flatClassification = [this.selectedOrg.name].concat(classificationArray).join(";");
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

    addMeshDescriptor() {
        this.mapping.meshDescriptors.push(this.descriptorID);
        this.descToName[this.descriptorID] = this.descriptorName;
        this.descriptorID = "";
        this.descriptorName = "";
        this.http.post("/meshClassification", this.mapping).map(res => res.json()).subscribe(
            res => {
                this.alert.addAlert("success", "Saved");
                this.mapping = res;
            }, err => this.alert.addAlert("danger", "There was an issue saving this record."));
    };

    removeDescriptor(i) {
        this.mapping.meshDescriptors.splice(i, 1);
        this.http.post("/meshClassification", this.mapping).map(res => res.json()).subscribe(
            res => {
                this.alert.addAlert("success", "Saved");
                this.mapping = res;
            }, err => this.alert.addAlert("danger", "There was an issue saving this record."));
    };

    isDescriptorAlreadyMapped = function (desc) {
        return this.mapping.meshDescriptors.indexOf(desc) > -1;
    };

    searchByClassification(node, orgName) {
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        return "/cde/search?selectedOrg=" + encodeURIComponent(orgName) +
            "&classification=" + encodeURIComponent(classificationArray.join(";"));
    };

    checkJob(type, cb) {
        let indexFn = setInterval(() => {
            this.http.get("/jobStatus/" + type).map(res => res.json()).subscribe(
                res => {
                    if (res.done === true)
                        this.onChangeOrg(this.selectedOrg.name, () => {
                            this.tree.treeModel.update();
                            clearInterval(indexFn);
                            if (cb) cb();
                        })
                });
        }, 5000);
    }

}