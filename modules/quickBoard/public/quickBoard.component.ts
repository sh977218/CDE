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
    ng1TemplateLoaded = {sideBySide: false};

    constructor(private alertService: AlertService,
                public exportService: ExportService,
                public quickBoardService: QuickBoardListService) {
        setTimeout(() => this.ng1TemplateLoaded.sideBySide = true, 10);
    }

    setDefaultQuickBoard(selectedQuickBoard: string) {
        this.quickBoardService.eltsToCompareMap = {};
        this.quickBoardService.setDefaultQuickBoard(selectedQuickBoard);
    }
}
