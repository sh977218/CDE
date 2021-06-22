import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { DataElement } from 'shared/de/dataElement.model';


@Component({
    selector: 'cde-mlt',
    templateUrl: 'moreLikeThis.component.html',
})
export class MoreLikeThisComponent {
    @Input() elt!: DataElement;
    @ViewChild('mltModal', {static: true}) mltModal!: TemplateRef<any>;
    @ViewChild('mltPinModal', {static: true}) mltPinModal!: PinBoardModalComponent;
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
