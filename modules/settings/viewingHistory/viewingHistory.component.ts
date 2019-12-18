import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { AlertService } from 'alert/alert.service';

class DataElementUI extends DataElement {
    isCollapsed: boolean = false;
}

class FormUI extends CdeForm {
    isCollapsed: boolean = false;
}

@Component({
    selector: 'cde-viewing-history',
    templateUrl: './viewingHistory.component.html'
})
export class ViewingHistoryComponent {
    cdes: DataElementUI[] = [];
    forms: FormUI[] = [];

    constructor(private http: HttpClient,
                private alert: AlertService) {
        this.http.get<DataElementUI[]>('/viewingHistory/dataElement').subscribe(
            response => this.cdes = Array.isArray(response) ? response : [],
            err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve data element view history.')
        );
        this.http.get<FormUI[]>('/server/form/viewingHistory/form').subscribe(
            response => this.forms = Array.isArray(response) ? response : [],
            err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve form view history.')
        );
    }

}
