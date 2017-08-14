import { Component } from '@angular/core';
import { AlertService } from 'system/public/components/alert/alert.service';
import { ExportService } from 'core/public/export.service';
import { QuickBoardListService } from 'board/public/components/quickBoard/quickBoardList.service';

@Component({
    selector: 'cde-quick-board',
    templateUrl: './quickBoard.component.html',
    providers: [QuickBoardListService],
})
export class QuickBoardComponent {
    listViews = {};
    ng1TemplateLoaded = {sideBySide: false};

    constructor(private alertService: AlertService,
                public exportService: ExportService,
                public quickBoardListService: QuickBoardListService) {
        setTimeout(() => this.ng1TemplateLoaded.sideBySide = true, 10 );
    }

    setDefaultQuickBoard(selectedQuickBoard: string) {
        this.quickBoardListService.eltsToCompareMap = {};
        this.quickBoardListService.setEltType(selectedQuickBoard);
    }
}
