import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { Source } from 'shared/models.model';

@Component({
    selector: 'cde-id-sources',
    templateUrl: './idSources.component.html',
    styles: [`
        .table th,
        .table td {
            padding: 0;
            vertical-align: middle;
        }
    `]
})
export class IdSourcesComponent {
    newId?: string;
    sources!: Source[];

    constructor(private alert: AlertService, private http: HttpClient) {
        this.http.get<Source[]>('/server/system/idSources')
            .subscribe(res => this.sources = res,
                err => this.alert.httpErrorMessageAlert(err)
            );
    }

    add() {
        this.http.post<Source>('/server/system/idSource/' + this.newId, {})
            .subscribe(res => this.sources.push(res),
                err => this.alert.httpErrorMessageAlert(err)
            );
        this.newId = undefined;
    }

    delete(source: Source, i: number) {
        this.http.delete('/server/system/idSource/' + source._id)
            .subscribe(() => this.sources.splice(i, 0),
                err => this.alert.httpErrorMessageAlert(err)
            );
    }

    update(source: Source) {
        this.http.put<Source>('/server/system/idSource/' + source._id, source)
            .subscribe(res => source = res,
                err => this.alert.httpErrorMessageAlert(err)
            );
    }
}
