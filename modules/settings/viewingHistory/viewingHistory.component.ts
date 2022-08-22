import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

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
    templateUrl: './viewingHistory.component.html',
    styleUrls: ['./viewingHistory.component.scss'],
})
export class ViewingHistoryComponent {
    cdes: DataElementUI[] = [];
    forms: FormUI[] = [];

    constructor(private http: HttpClient,
                private alert: AlertService) {
        this.http.get<DataElementUI[]>('/server/de/viewingHistory').subscribe(
            response => this.cdes = Array.isArray(response) ? response : [],
            err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve data element view history.')
        );
        this.http.get<FormUI[]>('/server/form/viewingHistory').subscribe(
            response => this.forms = Array.isArray(response) ? response : [],
            err => this.alert.httpErrorMessageAlert(err, 'Error, unable to retrieve form view history.')
        );
    }

}
