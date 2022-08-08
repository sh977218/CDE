import { Component, Inject } from '@angular/core';
import { DataElement } from 'shared/de/dataElement.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AlertService } from 'alert/alert.service';

type MoreLikeThisDataElement = DataElement & { isCollapsed: boolean };

@Component({
    templateUrl: './more-like-this-modal.component.html'
})
export class MoreLikeThisModalComponent {
    cdes: MoreLikeThisDataElement[] = [];

    constructor(private http: HttpClient,
                @Inject(MAT_DIALOG_DATA) public elt: MoreLikeThisDataElement,
                private alert: AlertService) {
        this.http.get<{ cdes: MoreLikeThisDataElement[] }>(`/server/de/moreLike/${elt.tinyId}`)
            .subscribe(response => this.cdes = response.cdes,
                () => this.alert.addAlert('error', 'Unable to retrieve MLT'));
    }

}
