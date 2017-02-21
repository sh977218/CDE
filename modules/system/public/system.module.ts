import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule } from "ng2-bootstrap";

import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { ProfileComponent } from "./profile.component";
import { upgradeAdapter } from "../../upgrade";
import { UserCommentsComponent } from "./userComments.component";


@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("inlineEdit"),
        upgradeAdapter.upgradeNg1Component("cdeAccordionList"),
        ProfileComponent,
        UserCommentsComponent,
        PlaceHoldEmptyPipe],
    providers: [],
    imports: [CommonModule, FormsModule, PaginationModule.forRoot()],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SystemModule {
}
