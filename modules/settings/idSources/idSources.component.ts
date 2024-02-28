import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import {
    IdSourcePutResponse,
    IdSourceRequest,
    IdSourceResponse,
    IdSourcesResponse,
} from 'shared/boundaryInterfaces/API/system';
import { IdSource } from 'shared/models.model';

@Component({
    selector: 'cde-id-sources',
    templateUrl: './idSources.component.html',
    styles: [
        `
            .table th,
            .table td {
                padding: 0;
                vertical-align: middle;
            }
        `,
    ],
})
export class IdSourcesComponent {
    newId?: string;
    sources!: IdSource[];

    constructor(private alert: AlertService, private http: HttpClient) {
        this.http.get<IdSourcesResponse>('/server/system/idSources').subscribe(
            res => (this.sources = res),
            err => this.alert.httpErrorAlert(err)
        );
    }

    add() {
        this.http.post<IdSourceResponse>('/server/system/idSource/' + this.newId, {} as IdSourceRequest).subscribe(
            res => this.sources.push(res),
            err => this.alert.httpErrorAlert(err)
        );
        this.newId = undefined;
    }

    delete(source: IdSource, i: number) {
        this.http.delete('/server/system/idSource/' + source._id).subscribe(
            () => this.sources.splice(i, 0),
            err => this.alert.httpErrorAlert(err)
        );
    }

    update(source: IdSource) {
        this.http
            .put<IdSourcePutResponse>('/server/system/idSource/' + source._id, source as IdSourceRequest)
            .subscribe(
                res => {},
                err => this.alert.httpErrorAlert(err)
            );
    }
}
