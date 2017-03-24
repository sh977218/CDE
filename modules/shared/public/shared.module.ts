import { NgModule } from "@angular/core";
import { upgradeAdapter } from "../../upgrade";

const InlineAreaEdit = upgradeAdapter.upgradeNg1Component("inlineAreaEdit");
const InlineEditComponent = upgradeAdapter.upgradeNg1Component("inlineEdit");
const SortableArrayComponent = upgradeAdapter.upgradeNg1Component("sortableArray");

@NgModule({
    declarations: [
/*
        InlineAreaEdit,
        InlineEditComponent,
        SortableArrayComponent
*/
    ],
    providers: [],
    exports: [/*
        InlineAreaEdit,
        InlineEditComponent,
        SortableArrayComponent*/
    ]
})
export class SharedModule {
}