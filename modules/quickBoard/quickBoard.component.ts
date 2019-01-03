import { Component } from '@angular/core';
import { ExportService } from 'core/export.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { LocalStorageService } from 'angular-2-local-storage';
import { MatTabChangeEvent } from '@angular/material';

@Component({
    selector: 'cde-quick-board',
    templateUrl: './quickBoard.component.html',
})
export class QuickBoardComponent {
    defaultQuickBoard: string = 'dataElementQuickBoard';

    constructor(private localStorageService: LocalStorageService,
                public exportService: ExportService,
                public quickBoardService: QuickBoardListService) {
        let defaultQb = <string>  this.localStorageService.get('defaultQuickBoard');
        if (defaultQb === 'form') {
            this.defaultQuickBoard = "formQuickBoard";
        }
        this.quickBoardService.loadElements();
    }

    tabChange(event: MatTabChangeEvent) {
        if (event.tab.textLabel.startsWith("Form")) this.defaultQuickBoard = 'formQuickBoard';
        if (event.tab.textLabel.startsWith("CDE")) this.defaultQuickBoard = 'dataElementQuickBoard';

        this.quickBoardService.setDefaultQuickBoard(event);
    }

}
