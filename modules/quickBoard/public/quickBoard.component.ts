import { Component } from '@angular/core';
import { AlertService } from 'system/public/components/alert/alert.service';
import { ExportService } from 'core/public/export.service';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';

@Component({
    selector: 'cde-quick-board',
    templateUrl: './quickBoard.component.html'
})
export class QuickBoardComponent {
    listViews = {};

    constructor(private alertService: AlertService,
                public exportService: ExportService,
                public quickBoardService: QuickBoardListService) {
    }

    setDefaultQuickBoard(selectedQuickBoard: string) {
        this.quickBoardService.eltsToCompareMap = {};
        this.quickBoardService.setDefaultQuickBoard(selectedQuickBoard);
    }
}
