import { Component } from '@angular/core';
import { QuickBoardListService } from '_app/quickBoardList.service';

import { MatTabChangeEvent } from '@angular/material/tabs';
import { LocalStorageService } from 'non-core/localStorage.service';

@Component({
    selector: 'cde-quick-board',
    templateUrl: './quickBoard.component.html',
})
export class QuickBoardComponent {
    defaultQuickBoard = 'dataElementQuickBoard';

    constructor(private localStorageService: LocalStorageService,
                public quickBoardService: QuickBoardListService) {
        const defaultQb = this.localStorageService.getItem('defaultQuickBoard');
        if (defaultQb === 'form') {
            this.defaultQuickBoard = 'formQuickBoard';
        }
        this.quickBoardService.loadElements();
    }

    tabChange(event: MatTabChangeEvent) {
        if (event.tab.textLabel.startsWith('Form')) {
            this.defaultQuickBoard = 'formQuickBoard';
        }
        if (event.tab.textLabel.startsWith('CDE')) {
            this.defaultQuickBoard = 'dataElementQuickBoard';
        }

        this.quickBoardService.setDefaultQuickBoard(event);
    }

}
