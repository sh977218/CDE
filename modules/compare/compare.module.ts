import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CompareKeysPipe } from "./CompareKeysPipe";
import { DiffMatchPatchModule, DiffDirective } from "ng-diff-match-patch";
import { CompareObjectComponent } from "./compareObject.component";
import { CompareArrayComponent } from "./CompareArray.component";
import { ScrollSpyModule } from "ng2-scrollspy";

@NgModule({
    declarations: [CompareArrayComponent, CompareObjectComponent, CompareKeysPipe],
    entryComponents: [CompareArrayComponent, CompareObjectComponent],
    providers: [],
    imports: [CommonModule, FormsModule, NgbModule, ScrollSpyModule.forRoot(), DiffMatchPatchModule],
    exports: [CompareArrayComponent, CompareObjectComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CompareModule {

}
