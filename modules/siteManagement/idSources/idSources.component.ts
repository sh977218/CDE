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
    sources: Source[];

    constructor(private alert: AlertService, private http: HttpClient) {
        this.load();
    }

    add() {
        this.save(new Source(this.newId));
        this.newId = undefined;
    }

    delete(source: Source) {
        this.http.delete('/idSource/' + source._id).subscribe(() => this.load());
    }

    update(event: any, app: Source) {
        //
        this.save(app);
    }

    load() {
        this.http.get<Source[]>('/idSources').subscribe(res => this.sources = res);
    }

    save(source: Source) {
        this.http.put('/idSource', source).subscribe(
            () => this.load(),
            err => this.alert.httpErrorMessageAlert(err)
        );
    }
}
