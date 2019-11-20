import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { isCdeForm } from 'shared/item';
import { CdeId, Item, Source } from 'shared/models.model';

@Component({
    selector: 'cde-identifiers',
    templateUrl: './identifiers.component.html'
})
export class IdentifiersComponent {
    @Input() set elt(e) {
        this._elt = e;
        this.idsLinks.length = 0;
        if (this._elt) {
            this._elt.ids.forEach(id => {
                this.getIdSource(id).then(source => this.addLink(source, id));
            });
        }
    }
    get elt() {
        return this._elt;
    }
    @Input() canEdit = false;
    @Output() eltChange = new EventEmitter();
    @ViewChild('newIdentifierContent', {static: true}) newIdentifierContent!: TemplateRef<any>;
    _elt!: Item;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    idsLinks: string[] = [];
    idSourcesPromise!: Promise<Source[]>;
    newIdentifier!: CdeId;

    constructor(private alert: AlertService,
                public dialog: MatDialog,
                private http: HttpClient) {
    }

    addNewIdentifier() {
        this.elt.ids.push(this.newIdentifier);
        this.getIdSource(this.newIdentifier).then(source => this.addLink(source, this.newIdentifier));
        this.eltChange.emit();
        this.dialogRef.close();
    }

    addLink(source: Source, id: CdeId) {
        this.idsLinks.push(IdentifiersComponent.linkWithId(
            source && (isCdeForm(this.elt) ? source.linkTemplateForm : source.linkTemplateDe),
            id
        ));
    }

    getIdSource(id: CdeId) {
        return this.getIdSources().then(sources => sources.filter(source => source._id === id.source)[0]);
    }

    getIdSources(): Promise<Source[]> {
        if (this.idSourcesPromise) {
            return this.idSourcesPromise;
        } else {
            return this.idSourcesPromise = this.http.get<Source[]>('/idSources').toPromise().catch(err => {
                this.alert.httpErrorMessageAlert(err);
                return [];
            });
        }
    }

    openNewIdentifierModal() {
        this.newIdentifier = new CdeId();
        this.dialogRef = this.dialog.open(this.newIdentifierContent, {width: '800px'});
    }

    removeIdentifierByIndex(index: number) {
        this.elt.ids.splice(index, 1);
        this.idsLinks.splice(index, 1);
        this.eltChange.emit();
    }

    static linkWithId(link = '', id: CdeId) {
        return link
            .replace('{{id}}', id.id || '')
            .replace('{{version}}', id.version || '');
    }
}
