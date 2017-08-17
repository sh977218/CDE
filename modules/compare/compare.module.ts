import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SortableModule } from 'ngx-bootstrap';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DiffMatchPatchModule, DiffDirective } from "ng-diff-match-patch";
import { CompareSideBySideComponent } from 'compare/compareSideBySide/compareSideBySide.component';
import { MergeFormComponent } from 'compare/mergeForm/mergeForm.component';
import { CompareArrayComponent } from 'compare/compareArray/compareArray.component';
import { CompareObjectComponent } from 'compare/compareObject/compareObject.component';
import { CdeSortableComponent } from 'compare/cdeSortable/cdeSortable.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SortableModule.forRoot(),
        DiffMatchPatchModule,
    ],
    declarations: [
        CdeSortableComponent,
        CompareSideBySideComponent,
        CompareArrayComponent,
        CompareObjectComponent,
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
