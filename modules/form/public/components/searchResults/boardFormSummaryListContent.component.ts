import { Component, Input } from "@angular/core";
import { BoardService } from "../../../../board/public/components/searchResults/board.service";
import { SummaryComponent } from "search";


@Component({
    selector: "cde-board-form-summary-list-content",
    templateUrl: "./boardFormSummaryListContent.component.html",
})
export class BoardFormSummaryListContentComponent implements SummaryComponent {
    @Input() elt: any;
    @Input() eltIndex: any;

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'form';

    constructor(public boardService: BoardService) {}

    getStewards() {
        return this.elt.classification.map(cl => cl.stewardOrg.name).join(' ');
    }
}