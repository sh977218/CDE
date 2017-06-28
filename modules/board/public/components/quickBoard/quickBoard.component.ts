import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'system/public/components/alert/alert.service';
import { ExportService } from 'core/public/export.service';
import { QuickBoardListService } from 'board/public/components/quickBoard/quickBoardList.service';

@Component({
    selector: 'cde-quick-board',
    templateUrl: './quickBoard.component.html',
    providers: [QuickBoardListService],
})
export class QuickBoardComponent {
    @ViewChild("sideBySideModal") public sideBySideModal: NgbModal;

    eltsToCompare: any[];
    listViews = {};

    constructor(private alertService: AlertService,
                public exportService: ExportService,
                private modalService: NgbModal,
                public quickBoardListService: QuickBoardListService) {
    }

    setDefaultQuickBoard(selectedQuickBoard: string) {
        this.quickBoardListService.eltsToCompareMap = {};
        this.quickBoardListService.setEltType(selectedQuickBoard);
    }

    showSideBySideView() {
        this.eltsToCompare = this.quickBoardListService.getSelectedElts();

        if (this.eltsToCompare.length !== 2) {
            this.alertService.addAlert("danger", "You may only compare 2 elements side by side.");
            return;
        }

        this.eltsToCompare.sort();
        this.modalService.open(this.sideBySideModal, {size: "lg"});
    };
}
