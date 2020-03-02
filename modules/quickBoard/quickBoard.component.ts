import { Component } from '@angular/core';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
    selector: 'cde-quick-board',
    templateUrl: './quickBoard.component.html',
})
export class QuickBoardComponent {
    defaultQuickBoard = 'dataElementQuickBoard';

    constructor(private localStorageService: LocalStorage,
                public quickBoardService: QuickBoardListService) {
        this.localStorageService
            .getItem('defaultQuickBoard')
            .subscribe((defaultQb: any) => {
                if (defaultQb === 'form') {
                    this.defaultQuickBoard = 'formQuickBoard';
                }
                this.quickBoardService.loadElements();
            });
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
