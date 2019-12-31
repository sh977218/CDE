import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule, MatCheckboxModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'ngx-bootstrap/sortable';
import { DiffMatchPatchModule } from 'ng-diff-match-patch';

import { CdeSortableComponent } from 'compare/cdeSortable/cdeSortable.component';
import { CompareItemArrayComponent } from 'compare/compareItem/compareItemArray.component';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { CompareItemComponent } from 'compare/compareItem/compareItem.component';
import { CompareSideBySideComponent } from 'compare/compareSideBySide/compareSideBySide.component';
import { MergeDataElementComponent } from 'compare/mergeDataElement/mergeDataElement.component';
import { MergeFormComponent } from 'compare/mergeForm/mergeForm.component';
import { MergeDeService } from './mergeDe.service';
import { MergeFormService } from './mergeForm.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SortableModule.forRoot(),
        DiffMatchPatchModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatIconModule,
        MatProgressBarModule,
    ],
    declarations: [
        CdeSortableComponent,
        CompareSideBySideComponent,
        CompareItemArrayComponent,
        CompareHistoryContentComponent,
        CompareItemComponent,
        MergeDataElementComponent,
        MergeFormComponent,
    ],
    entryComponents: [
        CompareItemArrayComponent,
        CompareItemComponent,
        CompareHistoryContentComponent
    ],
    providers: [MergeDeService, MergeFormService],
    exports: [
        CompareSideBySideComponent,
        CompareItemArrayComponent,
        CompareHistoryContentComponent,
        CompareItemComponent,
    ],
    schemas: []
})

export class CompareModule {
}
