import {CommonModule} from "@angular/common";
import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

import {PlaceHoldEmptyPipe} from "./placeHoldEmpty.pipe";
import {ProfileComponent} from "./profile.component";
import {upgradeAdapter} from "../../upgrade";
import {UserCommentsComponent} from "./userComments.component";

@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("inlineEdit"),
        upgradeAdapter.upgradeNg1Component("cdeAccordionList"),
        ProfileComponent,
        UserCommentsComponent,
        PlaceHoldEmptyPipe],
    providers: [],
    imports: [CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SystemModule {
}
