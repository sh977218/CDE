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

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SortableModule.forRoot(),
        DiffMatchPatchModule,
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        CdeSortableComponent,
        CompareSideBySideComponent,
        CompareArrayComponent,
        CompareObjectComponent,
        MergeDataElementComponent,
        MergeFormComponent,
    ],
    entryComponents: [
        CompareArrayComponent,
        CompareObjectComponent
    ],
    providers: [],
    exports: [
        CompareSideBySideComponent,
        CompareArrayComponent,
        CompareObjectComponent,
    ],
    schemas: []
})

export class CompareModule {
}
