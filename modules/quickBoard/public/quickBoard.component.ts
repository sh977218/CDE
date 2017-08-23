import { Component, OnInit } from '@angular/core';
import { AlertService } from 'system/public/components/alert/alert.service';
import { ExportService } from 'core/public/export.service';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
    selector: 'cde-quick-board',
    templateUrl: './quickBoard.component.html'
})
export class QuickBoardComponent implements OnInit {
    defaultQuickBoard: string = 'dataElementQuickBoard';
    listViews = {};

    constructor(private localStorageService: LocalStorageService,
                public exportService: ExportService,
                public quickBoardService: QuickBoardListService) {
        let defaultQb = <string>  this.localStorageService.get('defaultQuickBoard');
        if (defaultQb === "form") {
            this.defaultQuickBoard = "formQuickBoard";
        }
    }

    ngOnInit(): void {
        this.quickBoardService.loadElements();
    }
}
