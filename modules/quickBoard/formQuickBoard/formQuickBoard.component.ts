import { Component } from '@angular/core';
import { QuickBoardListService } from '_app/quickBoardList.service';

@Component({
    selector: 'cde-form-quick-board',
    templateUrl: 'formQuickBoard.component.html',
})
export class FormQuickBoardComponent {
    listViews = {};

    constructor(public quickBoardService: QuickBoardListService) {}
}
