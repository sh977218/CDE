import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { deOrForm, Item } from 'shared/item';

@Component({
    selector: 'cde-admin-item-sources[elt]',
    templateUrl: './sources.component.html',
    styleUrls: ['./sources.component.scss'],
})
export class SourcesComponent {
    sourceUrls: any = {};

    @Input() set elt(e: Item) {
        e.sources.forEach((s: any) => {
            const url = `/server/${deOrForm(e.elementType)}/originalSource/${s.sourceName}/${e.tinyId}`;
            this.http.head(url).subscribe(
                () => (this.sourceUrls[s.sourceName] = url),
                err => delete this.sourceUrls[s.sourceName]
            );
        });
        this._elt = e;
    }

    get elt() {
        return this._elt;
    }

    private _elt!: Item;

    constructor(private http: HttpClient) {}
}
