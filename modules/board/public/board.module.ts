import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { PinModalComponent } from "./components/pinModal/pinModal.component";
import { MyBoardsService } from "./myBoards.service";

@NgModule({
    declarations: [
        PinModalComponent,
    ],
    providers: [],
    imports: [CommonModule, FormsModule, NgbModule],
    exports: [PinModalComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardModule {
}
