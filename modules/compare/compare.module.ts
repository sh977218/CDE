import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CompareSideBySideComponent } from "./compareSideBySide.component";
import { CompareKeysPipe } from "./CompareKeysPipe";
import { DiffMatchPatchModule, DiffDirective } from 'ng-diff-match-patch';
import { CompareObjectComponent } from "./compareObject.component";

@NgModule({
    declarations: [CompareSideBySideComponent, CompareObjectComponent, CompareKeysPipe],
    entryComponents: [CompareSideBySideComponent, CompareObjectComponent],
    providers: [],
    imports: [CommonModule, FormsModule, NgbModule, DiffMatchPatchModule],
    exports: [CompareSideBySideComponent, CompareObjectComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CompareModule {

}
