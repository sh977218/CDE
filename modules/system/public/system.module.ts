import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { ProfileComponent } from "./components/profile.component";
import { upgradeAdapter } from "../../upgrade";
import { UserCommentsComponent } from "./userComments.component";
import { IdentifiersComponent } from "./components/adminItem/identifiers.component";
import { PaginationModule, ModalModule } from "ng2-bootstrap/index";

@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("inlineEdit"),
        upgradeAdapter.upgradeNg1Component("cdeAccordionList"),
        upgradeAdapter.upgradeNg1Component("formAccordionList"),
        ProfileComponent,
        IdentifiersComponent,
        UserCommentsComponent,
        PlaceHoldEmptyPipe],
    providers: [],
    imports: [CommonModule, FormsModule, ModalModule.forRoot(), PaginationModule.forRoot()],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
