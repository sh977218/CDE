import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { ITEM_MAP } from 'shared/item';
import { Item } from 'shared/models.model';
import { UserService } from '_app/user.service';

class HistoryDe extends DataElement {
    promise?: Promise<History>;
    selected?: boolean;
    url?: string;
    user?: string;
}

class HistoryForm extends CdeForm {
    promise?: Promise<History>;
    selected?: boolean;
    url?: string;
    user?: string;
}

type History = HistoryDe | HistoryForm;

function createHistory(elt: DataElement | CdeForm): History {
    return Object.create(elt);
}

@Component({
    selector: 'cde-history',
    templateUrl: './history.component.html',
})
export class HistoryComponent {
    @Input() canEdit = false;

    @Input() set elt(elt: Item) {
        this._elt = elt;
        let url = '/server/de/priors/' + this.elt._id;
        if (this.elt.elementType === 'form') {
            url = '/server/form/priors/' + this.elt._id;
        }
        this.http.get<History[]>(url).subscribe(
            res => {
                this.priorElementsFull = res;
                this.priorElementsFull.forEach(pe => {
                    pe.url = ITEM_MAP[this.elt.elementType].viewById + pe._id;
                });
                if (this.elt.isDraft && this.canEdit) {
                    this.priorElementsFull.unshift(createHistory(this.elt));
                    this.priorElementsFull[0].selected = false;
                }
                this.collapseList();
            },
            err => this.alert.httpErrorAlert(err, 'Error retrieving history:')
        );
    }

    get elt() {
        return this._elt;
    }

    private _elt!: Item;
    numberSelected = 0;
    priorElementsFull!: History[];
    priorElements!: History[];

    showVersioned = false;
    toggled = false;

    constructor(
        private dialog: MatDialog,
        private alert: AlertService,
        private http: HttpClient,
        public userService: UserService
    ) {}

    selectRow(index: number) {
        const priorElt = this.priorElementsFull[index];
        if (this.numberSelected === 2 && !priorElt.selected) {
            priorElt.selected = false;
        } else if (this.numberSelected === 2 && priorElt.selected) {
            priorElt.selected = false;
            this.numberSelected--;
        } else {
            priorElt.selected = !priorElt.selected;
            if (priorElt.selected) {
                this.numberSelected++;
            } else {
                this.numberSelected--;
            }
        }
    }

    openHistoryCompareModal() {
        Promise.all(
            this.priorElementsFull
                .filter(pe => pe.selected && !pe.tinyId)
                .map(priorElt => {
                    const url =
                        ITEM_MAP[priorElt.elementType][priorElt.isDraft ? 'apiDraftById' : 'apiById'] + priorElt._id;
                    return this.http
                        .get<History>(url)
                        .toPromise()
                        .then(res => {
                            res.url = ITEM_MAP[res.elementType].viewById + res._id;
                            res.selected = true;
                            this.priorElementsFull[this.priorElementsFull.indexOf(priorElt)] = res;
                        });
                })
        ).then(
            () => {
                const twoSelected = this.priorElementsFull.filter(p => p.selected);
                const data = {
                    newer: twoSelected[0],
                    older: twoSelected[1],
                };
                this.dialog.open(CompareHistoryContentComponent, {
                    width: '800px',
                    data,
                });
            },
            err => this.alert.addAlert('danger', 'Error open history compare modal.' + err)
        );
    }

    expandList() {
        this.priorElements = this.priorElementsFull;
        this.toggled = true;
    }

    collapseList() {
        this.priorElements = this.priorElementsFull.slice(0, 4);
        this.toggled = false;
    }
}
