import { Component, OnInit } from "@angular/core";
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';

@Component({
    selector: "cde-data-element-quick-board",
    templateUrl: "dataElementQuickBoard.component.html"
})
export class DataElementQuickBoardComponent implements OnInit {
    listViews = {};

    constructor(public quickBoardService: QuickBoardListService) {
    }

    ngOnInit(): void {
    }
}