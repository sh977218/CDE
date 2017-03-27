import { NgModule } from "@angular/core";
import { upgradeAdapter } from "../../upgrade";
import { CommonModule } from "@angular/common";

const InlineAreaEditComponent = upgradeAdapter.upgradeNg1Component("inlineAreaEdit");
const InlineEditComponent = upgradeAdapter.upgradeNg1Component("inlineEdit");
const SortableArrayComponent = upgradeAdapter.upgradeNg1Component("sortableArray");

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        InlineAreaEditComponent,
        InlineEditComponent,
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