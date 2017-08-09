import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DiffMatchPatchModule, DiffDirective } from "ng-diff-match-patch";
import { CompareObjectComponent } from "./compareObject.component";
import { CompareArrayComponent } from "./compareArray.component";
import { CompareSideBySideComponent } from 'compare/compareSideBySide/compareSideBySideComponent';

@NgModule({
    declarations: [CompareArrayComponent, CompareObjectComponent, CompareSideBySideComponent],
    entryComponents: [CompareArrayComponent, CompareObjectComponent],
    providers: [],
    imports: [CommonModule, FormsModule, NgbModule, DiffMatchPatchModule],
    exports: [CompareArrayComponent, CompareObjectComponent, CompareSideBySideComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CompareModule {

}
