import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { DeleteClassificationModalComponent } from 'adminItem/classification/delete-classification-modal/delete-classification-modal.component';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { cumulative } from 'shared/array';
import {
    Classification,
    ClassificationElement,
    Item,
} from 'shared/models.model';
import { isSiteAdmin } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';

export interface DeletedNodeEvent {
    deleteClassificationArray: string[];
    deleteOrgName: string;
}

@Component({
    selector: 'cde-classification-view',
    templateUrl: './classificationView.component.html',
    styleUrls: ['./classificationView.component.scss'],
})
export class ClassificationViewComponent {
    @Input() elt!: Item;
    @Output() confirmDelete = new EventEmitter<DeletedNodeEvent>();
    isMdSize = false;
    orgHelperLoaded = false;

    constructor(
        private breakpointObserver: BreakpointObserver,
        public dialog: MatDialog,
        public isAllowedModel: IsAllowedService,
        protected userService: UserService,
        private orgHelperService: OrgHelperService
    ) {
        this.orgHelperService.then(() => (this.orgHelperLoaded = true), noop);
        this.breakpointObserver
            .observe(['(min-width: 768px)'])
            .subscribe(state => {
                this.isMdSize = state.matches;
            });
    }

    getClassification2ColumnHeight(): string {
        const heights = this.getClassificationDisplayHeights();
        const displayHeight = heights[heights.length - 1];
        if (!displayHeight) {
            return '0';
        }
        const halfHeight = displayHeight / 2;
        let i = 0;
        while (heights[i] < halfHeight) {
            i++;
        }
        return heights[i] + 'px'; // includes an extra gap height, but it doesn't seem to hurt anything
    }

    getClassificationDisplayHeights(): number[] {
        function countElements(elements: ClassificationElement[]): number {
            return (Array.isArray(elements) ? elements : []).reduce(
                (count, element) => count + 1 + countElements(element.elements),
                0
            );
        }
        const sectionEmptyHeight = 57;
        const sectionGapHeight = 20;
        const linkHeight = 24;
        return cumulative(
            this.elt.classification.map(c =>
                this.showWorkingGroups(c)
                    ? countElements(c.elements) * linkHeight +
                      sectionEmptyHeight +
                      sectionGapHeight
                    : 0
            ),
            (acc, sectionHeight) => acc + sectionHeight,
            0
        );
    }

    getClassifLink() {
        return '/' + this.elt.elementType + '/search';
    }

    openDeleteClassificationModal(
        node: ClassificationElement,
        deleteOrgName: string,
        path: string
    ) {
        this.dialog
            .open(DeleteClassificationModalComponent, {
                data: node.name,
            })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.confirmDelete.emit({
                        deleteClassificationArray: path.split(';'),
                        deleteOrgName,
                    });
                }
            });
    }

    showWorkingGroups(classification: Classification) {
        return this.orgHelperLoaded
            ? this.orgHelperService.showWorkingGroup(
                  classification.stewardOrg.name
              ) || isSiteAdmin(this.userService.user)
            : false;
    }
}
