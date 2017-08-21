import { Component, OnInit } from "@angular/core";
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { ExportService } from 'core/public/export.service';

@Component({
    selector: "cde-data-element-quick-board",
    templateUrl: "dataElementQuickBoard.component.html"
})
export class DataElementQuickBoardComponent {
    listViews = {};

    constructor(public quickBoardService: QuickBoardListService,
                public exportService: ExportService) {
    }
}