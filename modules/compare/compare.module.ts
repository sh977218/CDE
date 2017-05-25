import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CompareSideBySideComponent } from "./compareSideBySide.component";

@NgModule({
    declarations: [CompareSideBySideComponent],
    entryComponents: [CompareSideBySideComponent],
    providers: [],
    imports: [CommonModule, FormsModule, NgbModule],
    exports: [CompareSideBySideComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CompareModule {

}
