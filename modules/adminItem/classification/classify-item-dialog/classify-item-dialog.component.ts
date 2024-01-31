import { Component, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { map } from 'rxjs/operators';
import { UserService } from '_app/user.service';
import { ClassificationService } from 'non-core/classification.service';
import { Organization } from 'shared/organization/organization';
import { ClassificationNode } from '../../../classificationManagement/classification-node';
import { ClassificationDatabase } from '../../../classificationManagement/classification-database';
import { FlatClassificationNode } from '../../../classificationManagement/flat-classification-node';
import { DialogData } from '../../../classificationManagement/dialog-data';
import { ClassifyItemDialogData } from '../classifyItem.component';
import { ClassificationClassified, ClassificationClassifier } from 'shared/models.model';
import { LocalStorageService } from '../../../non-core/localStorage.service';

@Component({
    templateUrl: './classify-item-dialog.component.html',
    styleUrls: ['./classify-item-dialog.component.scss'],
    providers: [ClassificationDatabase],
})
export class ClassifyItemDialogComponent {
    orgClassificationsRecentlyAddView?: ClassificationClassifier[];

    selectedOrg: UntypedFormControl;

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

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private localStorageService: LocalStorageService,
        public userService: UserService,
        private classificationSvc: ClassificationService,
        private _database: ClassificationDatabase,
        public dialogRef: MatDialogRef<ClassifyItemDialogComponent, ClassificationClassified>,
        @Inject(MAT_DIALOG_DATA) public data: ClassifyItemDialogData
    ) {
        this.orgClassificationsRecentlyAddView = this.localStorageService.getItem('classificationHistory');

        this.selectedOrg = new UntypedFormControl(this.route.snapshot.queryParams.selectedOrg);
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<FlatClassificationNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        _database.dataChange.subscribe(data => {
            this.dataSource.data = data;
        });
    }

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

    getClassificationPath(node: FlatClassificationNode): DialogData {
        let currentNode: FlatClassificationNode | null = node;
        const path = [];
        do {
            path.unshift(currentNode.name);
            currentNode = this.getParentNode(currentNode);
        } while (currentNode);
        return {
            orgName: this.selectedOrg.value,
            categories: path,
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

        const startIndex = this.treeControl.dataNodes.indexOf(node);

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    getHtmlId(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        if (data.categories.length) {
            return data.categories.join(',');
        } else {
            return data.orgName;
        }
    }

    orgChanged(event: any, cb?: any) {
        this.http
            .get<Organization>('/server/orgManagement/org/' + encodeURIComponent(event.value))
            .pipe(map(org => org.classifications))
            .subscribe(data => {
                this._database.initialize(data);
                if (cb) {
                    cb();
                }
            });
    }

    classifyItemByTree(node: FlatClassificationNode) {
        const data = this.getClassificationPath(node);
        this.classificationSvc.updateClassificationLocalStorage(data);
        this.dialogRef.close({
            classificationArray: data.categories,
            selectedOrg: data.orgName,
        });
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
}
