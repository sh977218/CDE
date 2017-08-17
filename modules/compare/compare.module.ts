import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DiffMatchPatchModule, DiffDirective } from "ng-diff-match-patch";
import { CompareObjectComponent } from "./compareObject.component";
import { CompareArrayComponent } from "./compareArray.component";
import { CompareSideBySideComponent } from 'compare/compareSideBySide/compareSideBySide.component';
import { FormModule } from 'form/public/form.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        DiffMatchPatchModule,
    ],
    declarations: [
        CompareSideBySideComponent,
        CompareArrayComponent,
        CompareObjectComponent,
    ],
    entryComponents: [CompareArrayComponent, CompareObjectComponent],
    providers: [],
    exports: [
        CompareSideBySideComponent,
        CompareArrayComponent,
        CompareObjectComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CompareModule {

}
