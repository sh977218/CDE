import { Component, EventEmitter, Inject, Input, OnInit, Output } from "@angular/core";
import { Http } from "@angular/http";
import { BoardService } from "./board.service";

@Component({
    selector: "cde-board-pin-accordion",
    templateUrl: "./pinBoardAccordion.component.html",
})
export class PinBoardAccordionComponent {
    @Input() elt: any;
    @Input() eltIndex: any;

    pinModal: any;

    constructor(private http: Http,
                private boardService: BoardService,
                @Inject("Alert") private alert,
                @Inject("userResource") public userService) {}

    unpin(pin) {
        let url;
        if (pin.deTinyId)
            url = "/pin/cde/" + pin.deTinyId + "/" + this.boardService.board._id;
        else if (pin.formTinyId)
            url = "/pin/form/" + pin.formTinyId + "/" + this.boardService.board._id;

        this.http.delete(url).subscribe(() => {
            this.alert.addAlert("success", "Unpinned.");
            this.boardService.reload.emit();
        }, (response) => {
            this.alert.addAlert("danger", response.data);
            this.boardService.reload.emit();
        });
    }
}
