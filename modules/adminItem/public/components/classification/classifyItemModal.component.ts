import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap/tabset/tabset';
import { LocalStorageService } from 'angular-2-local-storage/dist';
import { TreeNode } from 'angular-tree-component/dist/models/tree-node.model';
import { IActionMapping } from 'angular-tree-component/dist/models/tree-options.model';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { ClassificationService } from 'core/classification.service';
import { ClassificationClassified, ClassificationHistory } from 'shared/models.model';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        }
    }
};


@Component({
    selector: 'cde-classify-item-modal',
    templateUrl: 'classifyItemModal.component.html',
    providers: [NgbActiveModal]
})
export class ClassifyItemModalComponent {
    @Input() modalTitle: string = 'Classify this CDE';
    @Output() onEltSelected = new EventEmitter<ClassificationClassified>();
    @ViewChild('classifyItemContent') classifyItemContent!: NgbModalModule;
    orgClassificationsTreeView: any;
    orgClassificationsRecentlyAddView?: ClassificationHistory[];
    options = {
        idField: 'name',
        childrenField: 'elements',
        displayField: 'name',
        isExpandedField: 'expanded',
        actionMapping: actionMapping
    };
    selectedOrg?: string;
    treeNode?: TreeNode;

    constructor(private classificationSvc: ClassificationService,
                private http: HttpClient,
                private localStorageService: LocalStorageService,
                public modalService: NgbModal,
                public userService: UserService) {
    }

    classifyItemByRecentlyAdd(classificationRecentlyAdd: ClassificationHistory) {
        this.classificationSvc.updateClassificationLocalStorage({
            categories: classificationRecentlyAdd.categories,
            orgName: classificationRecentlyAdd.orgName
        });
        this.onEltSelected.emit({
            classificationArray: classificationRecentlyAdd.categories,
            selectedOrg: classificationRecentlyAdd.orgName,
        });
    }

    classifyItemByTree(treeNode: TreeNode) {
        this.treeNode = treeNode;
        let classificationArray = [treeNode.data.name];
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
        this.onEltSelected.emit({
            classificationArray: classificationArray,
            selectedOrg: this.selectedOrg
        });
    }

    onChangeClassifyView(event: NgbTabChangeEvent) {
        if (event.nextId === 'recentlyAddViewTab') {
            this.orgClassificationsRecentlyAddView = this.localStorageService.get('classificationHistory');
        } else {
            this.orgClassificationsTreeView = null;
        }
    }

    onChangeOrg(value: string) {
        if (value) {
            let url = '/org/' + encodeURIComponent(value);
            //noinspection TypeScriptValidateTypes
            this.http.get(url).subscribe(
                res => {
                    this.selectedOrg = value;
                    this.orgClassificationsTreeView = res;
                }, () => {
                    this.orgClassificationsTreeView = {};
                });
        } else this.orgClassificationsTreeView = [];
    }

    openModal() {
        this.orgClassificationsTreeView = null;
        this.orgClassificationsRecentlyAddView = undefined;
        if (this.selectedOrg) {
            this.onChangeOrg(this.selectedOrg);
        } else {
            this.userService.then(() => {
                if (this.userService.userOrgs.length === 1) this.onChangeOrg(this.userService.userOrgs[0]);
            }, _noop);
        }
        return this.modalService.open(this.classifyItemContent);
    }
}
