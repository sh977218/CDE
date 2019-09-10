import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from 'shared/models.model';

@Component({
    selector: 'cde-admin-item-sources[elt]',
    templateUrl: './sources.component.html'
})
export class SourcesComponent {
    @Input() set elt(e: Item) {
        e.sources.forEach(async s => {
            const url = `/originalSource/${e.elementType}/${s.sourceName}/${e.tinyId}`;
            let result = true;
            await this.http.head(url).toPromise().catch(() => result = false);
            this.sourceUrls[url] = result;
        });
        this._elt = e;
    }
    get elt() {
        return this._elt;
    }
    private _elt!: Item;

    sourceUrls: any = {};

    constructor(private http: HttpClient) {}

}
