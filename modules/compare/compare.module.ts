import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'ngx-bootstrap/sortable';
import { NgxTextDiffModule } from 'cde-text-diff';

import { CdeSortableComponent } from 'compare/cdeSortable/cdeSortable.component';
import { CompareItemArrayComponent } from 'compare/compareItem/compareItemArray.component';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { CompareItemComponent } from 'compare/compareItem/compareItem.component';
import { CompareSideBySideComponent } from 'compare/compareSideBySide/compareSideBySide.component';
import { MergeDataElementComponent } from 'compare/mergeDataElement/mergeDataElement.component';
import { MergeFormComponent } from 'compare/mergeForm/mergeForm.component';
import { MergeDeService } from './mergeDe.service';
import { MergeFormService } from './mergeForm.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SortableModule.forRoot(),
        NgxTextDiffModule,
        MatButtonModule,
        MatCheckboxModule,
        MatTooltipModule,
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
