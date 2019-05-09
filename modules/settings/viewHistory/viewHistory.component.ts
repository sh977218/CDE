import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-view-history',
    templateUrl: './viewHistory.component.html'
})
export class ViewHistoryComponent implements OnInit {
    cdes: DataElement[] = [];
    forms: CdeForm[] = [];

    ngOnInit() {
    }

    constructor(private http: HttpClient,
                private alert: AlertService) {
        this.http.get<DataElement[]>('/viewingHistory/dataElement').subscribe(
            response => this.cdes = Array.isArray(response) ? response : [],
            err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve data element view history.')
        );
        this.http.get<CdeForm[]>('/viewingHistory/form').subscribe(
            response => this.forms = Array.isArray(response) ? response : [],
            err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve form view history.')
        );
    }

}
