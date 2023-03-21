import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { CompareSideBySideModalComponent } from 'compare/compareSideBySide/compare-side-by-side-modal/compare-side-by-side-modal.component';
import { CompareItem } from 'compare/compareSideBySide/compare-item';

@Component({
    selector: 'cde-compare-side-by-side',
    templateUrl: './compareSideBySide.component.html',
})
export class CompareSideBySideComponent {
    @Input() elements: CompareItem[] = [];

    constructor(public dialog: MatDialog, private alert: AlertService) {}

    openCompareSideBySideContent() {
        let selectedDEs = this.elements.filter(d => d.checked);
        if (this.elements.length === 2) {
            selectedDEs = this.elements;
        }
        if (selectedDEs.length !== 2) {
            this.alert.addAlert('warning', 'Please select only two elements to compare.');
            return;
        }
        const data = selectedDEs;

        this.dialog.open(CompareSideBySideModalComponent, { width: '1200px', data });
    }
}
