import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Select2Module } from "ng2-select2";
import { InlineEditDirective, InlineAreaEditDirective, SortableArrayDirective } from "./upgrade-components";

@NgModule({
    imports: [
        CommonModule,
        Select2Module
    ],
    declarations: [
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective,
    ],
    providers: [],
    exports: [
        InlineEditDirective,
        InlineAreaEditDirective,
        SortableArrayDirective
    ],
})
export class AdminModule {
}