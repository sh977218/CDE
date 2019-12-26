import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from 'shared/models.model';

@Component({
    selector: 'cde-admin-item-sources[elt]',
    templateUrl: './sources.component.html'
})
export class SourcesComponent {
    @Input() set elt(e: Item) {
        e.sources.forEach(s => {
            let url = `/server/de/originalSource/${s.sourceName}/${e.tinyId}`;
            if (e.elementType === 'form') {
                url = `/server/form/originalSource/${s.sourceName}/${e.tinyId}`;
            }
            this.http.head(url).subscribe(
                () => this.sourceUrls[s.sourceName] = url,
                err => delete this.sourceUrls[s.sourceName]
            );
        });
        this._elt = e;
    }

    get elt() {
        return this._elt;
    }

    private _elt!: Item;

    sourceUrls: any = {};

    constructor(private http: HttpClient) {
    }

}
