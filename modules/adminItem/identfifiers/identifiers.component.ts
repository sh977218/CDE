import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { IdSourcesResponse } from 'shared/boundaryInterfaces/API/system';
import { isCdeForm, Item } from 'shared/item';
import { CdeId, IdSource } from 'shared/models.model';
import { AddIdentifierModalComponent } from 'adminItem/identfifiers/add-identifier-modal/add-identifier-modal.component';
import { toPromise } from 'shared/observable';

@Component({
    selector: 'cde-identifiers',
    templateUrl: './identifiers.component.html',
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
    @ViewChild('newIdentifierContent', { static: true })
    newIdentifierContent!: TemplateRef<any>;
    _elt!: Item;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    idsLinks: string[] = [];
    idSourcesPromise!: Promise<IdSource[]>;

    constructor(private alert: AlertService, public dialog: MatDialog, private http: HttpClient) {}

    addLink(source: IdSource, id: CdeId) {
        this.idsLinks.push(
            IdentifiersComponent.linkWithId(
                id,
                source && (isCdeForm(this.elt) ? source.linkTemplateForm : source.linkTemplateDe)
            )
        );
    }

    getIdSource(id: CdeId) {
        return this.getIdSources().then(sources => sources.filter(source => source._id === id.source)[0]);
    }

    getIdSources(): Promise<IdSource[]> {
        if (this.idSourcesPromise) {
            return this.idSourcesPromise;
        } else {
            return (this.idSourcesPromise = toPromise(
                this.http.get<IdSourcesResponse>('/server/system/idSources')
            ).catch(err => {
                this.alert.httpErrorAlert(err);
                return [];
            }));
        }
    }

    removeIdentifierByIndex(index: number) {
        this.elt.ids.splice(index, 1);
        this.idsLinks.splice(index, 1);
        this.eltChange.emit();
    }

    openNewIdentifierModal() {
        this.dialog
            .open<AddIdentifierModalComponent, Promise<IdSource[]>, CdeId>(AddIdentifierModalComponent, {
                width: '800px',
                data: this.getIdSources(),
            })
            .afterClosed()
            .subscribe(newIdentifier => {
                if (newIdentifier) {
                    this.getIdSource(newIdentifier).then(source => this.addLink(source, newIdentifier));
                    this.elt.ids.push(newIdentifier);
                    this.eltChange.emit();
                }
            });
    }

    static linkWithId(id: CdeId, link = '') {
        return link.replace('{{id}}', id.id || '').replace('{{version}}', id.version || '');
    }
}
