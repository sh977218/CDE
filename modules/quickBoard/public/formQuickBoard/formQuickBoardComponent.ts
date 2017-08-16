import { Component, OnInit } from '@angular/core';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';

@Component({
    selector: "cde-form-quick-board",
    templateUrl: "formQuickBoard.component.html"
})
export class FormQuickBoardComponent {
    listViews = {};

    constructor(public quickBoardService: QuickBoardListService) {
    }
}