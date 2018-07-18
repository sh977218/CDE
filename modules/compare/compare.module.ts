import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SortableModule } from 'ngx-bootstrap';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DiffMatchPatchModule } from "ng-diff-match-patch";

import { CdeSortableComponent } from 'compare/cdeSortable/cdeSortable.component';
import { CompareArrayComponent } from 'compare/compareArray/compareArray.component';
import { CompareObjectComponent } from 'compare/compareObject/compareObject.component';
import { CompareSideBySideComponent } from 'compare/compareSideBySide/compareSideBySide.component';
import { MergeDataElementComponent } from 'compare/mergeDataElement/mergeDataElement.component';
import { MergeFormComponent } from 'compare/mergeForm/mergeForm.component';
import { WidgetModule } from 'widget/widget.module';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { MatIconModule } from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SortableModule.forRoot(),
        DiffMatchPatchModule,
        MatIconModule,
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        CdeSortableComponent,
        CompareSideBySideComponent,
        CompareArrayComponent,
        CompareHistoryContentComponent,
        CompareObjectComponent,
        MergeDataElementComponent,
        MergeFormComponent,
    ],
    entryComponents: [
        CompareArrayComponent,
        CompareObjectComponent,
        CompareHistoryContentComponent
    ],
    providers: [],
    exports: [
        CompareSideBySideComponent,
        CompareArrayComponent,
        CompareHistoryContentComponent,
        CompareObjectComponent,
    ],
    schemas: []
})

export class CompareModule {
}
