import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { NgxTextDiffModule } from 'ngx-text-diff';
import { CdeSortableComponent } from 'compare/cdeSortable/cdeSortable.component';
import { CompareItemArrayComponent } from 'compare/compareItem/compareItemArray.component';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { CompareItemComponent } from 'compare/compareItem/compareItem.component';
import { CompareSideBySideComponent } from 'compare/compareSideBySide/compareSideBySide.component';
import { MergeDataElementComponent } from 'compare/mergeDataElement/mergeDataElement.component';
import { MergeFormComponent } from 'compare/mergeForm/mergeForm.component';
import { MergeFormService } from 'compare/mergeForm.service';
import { SortableModule } from 'ngx-bootstrap/sortable';
import {
    CompareSideBySideModalComponent
} from 'compare/compareSideBySide/ompare-side-by-side-modal/compare-side-by-side-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SortableModule.forRoot(),
        MatButtonModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatDialogModule,
        MatIconModule,
        MatProgressBarModule,
        NgxTextDiffModule,
    ],
    declarations: [
        CdeSortableComponent,
        CompareSideBySideComponent,
        CompareSideBySideModalComponent,
        CompareItemArrayComponent,
        CompareHistoryContentComponent,
        CompareItemComponent,
        MergeDataElementComponent,
        MergeFormComponent,
    ],
    providers: [MergeFormService],
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
