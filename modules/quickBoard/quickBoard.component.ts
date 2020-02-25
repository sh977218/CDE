import { Component } from '@angular/core';
import { ExportService } from 'non-core/export.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { LocalStorageService } from 'angular-2-local-storage';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
    selector: 'cde-quick-board',
    templateUrl: './quickBoard.component.html',
})
export class QuickBoardComponent {
    defaultQuickBoard = 'dataElementQuickBoard';

    constructor(private localStorageService: LocalStorageService,
                public exportService: ExportService,
                public quickBoardService: QuickBoardListService) {
        const defaultQb = this.localStorageService.get('defaultQuickBoard') as string;
        if (defaultQb === 'form') {
            this.defaultQuickBoard = 'formQuickBoard';
        }
        this.quickBoardService.loadElements();
    }

    tabChange(event: MatTabChangeEvent) {
        if (event.tab.textLabel.startsWith('Form')) { this.defaultQuickBoard = 'formQuickBoard'; }
        if (event.tab.textLabel.startsWith('CDE')) { this.defaultQuickBoard = 'dataElementQuickBoard'; }

        this.quickBoardService.setDefaultQuickBoard(event);
    }

}
