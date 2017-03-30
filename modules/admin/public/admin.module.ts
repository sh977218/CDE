import { NgModule } from "@angular/core";
import { upgradeAdapter } from "../../upgrade";
import { CommonModule } from "@angular/common";
import { Select2Module } from "ng2-select2";

const InlineEditComponent = upgradeAdapter.upgradeNg1Component("inlineEdit");
const InlineAreaEditComponent = upgradeAdapter.upgradeNg1Component("inlineAreaEdit");
const SortableArrayComponent = upgradeAdapter.upgradeNg1Component("sortableArray");

@NgModule({
    imports: [
        CommonModule,
        Select2Module
    ],
    declarations: [
        InlineEditComponent,
        InlineAreaEditComponent,
        SortableArrayComponent
    ],
    providers: [],
    exports: [
        InlineAreaEditComponent,
        InlineEditComponent,
        SortableArrayComponent
    ]
})
export class AdminModule {
}