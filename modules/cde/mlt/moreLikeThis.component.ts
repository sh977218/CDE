import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { DataElement } from 'shared/de/dataElement.model';
import { PinToBoardModalComponent } from 'board/pin-to-board/pin-to-board-modal.component';


@Component({
    selector: 'cde-mlt',
    templateUrl: './moreLikeThis.component.html',
    styleUrls: ['./moreLikeThis.component.scss'],
})
export class MoreLikeThisComponent {
    @Input() elt!: DataElement;
    @ViewChild('mltModal', {static: true}) mltModal!: TemplateRef<any>;
    @ViewChild('mltPinModal', {static: true}) mltPinModal!: PinToBoardModalComponent;
    cdes!: DataElement[];

    constructor(
        private http: HttpClient,
        private router: Router,
        private alert: AlertService,
        private dialog: MatDialog,
    ) {}

    open() {
        this.http.get<{cdes: DataElement[]}>('/server/de/moreLike/' + this.elt.tinyId).subscribe(response => {
            this.cdes = response.cdes;
        }, () => this.alert.addAlert('error', 'Unable to retrieve MLT'));
        this.dialog.open(this.mltModal, {width: '1000px'});
    }
}
