import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { ITEM_MAP } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { CompareHistoryComponent } from 'compare/compareHistory/compareHistory.component';

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
    return Object.create(elt.elementType === 'cde' ? DataElement.copy(elt as DataElement) : CdeForm.copy(elt as CdeForm));
}

@Component({
    selector: 'cde-history',
    templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit {
    @Input() public elt: DataElement | CdeForm;
    @Input() public canEdit: boolean = false;
    showVersioned: boolean = false;
    public priorElements: History[];
    public numberSelected: number = 0;
    @ViewChild('compareHistoryModal') public compareHistoryModal: CompareHistoryComponent;


    constructor(private alert: AlertService,
                private http: HttpClient) {
    }

    ngOnInit(): void {
        let url = ITEM_MAP[this.elt.elementType].apiById + this.elt._id + ITEM_MAP[this.elt.elementType].apiById_prior;
        this.http.get<History[]>(url).subscribe(res => {
            this.priorElements = res;
            this.priorElements.forEach(pe => {
                pe.url = ITEM_MAP[this.elt.elementType].viewById + pe._id;
            });
            if (this.elt.isDraft && this.canEdit) {
                this.priorElements.unshift(createHistory(this.elt));
                this.priorElements[0].selected = false;
            }
        }, err => this.alert.httpErrorMessageAlert(err, 'Error retrieving history:'));
    }

    selectRow(index) {
        let priorElt = this.priorElements[index];
        if (this.numberSelected === 2 && !priorElt.selected) {
            priorElt.selected = false;
        } else if (this.numberSelected === 2 && priorElt.selected) {
            priorElt.selected = false;
            this.numberSelected--;
        } else {
            priorElt.selected = !priorElt.selected;
            if (priorElt.selected) this.numberSelected++;
            else this.numberSelected--;
        }
    }

    newer;
    older;

    openHistoryCompareModal() {
        Promise.all(this.priorElements.filter(pe => pe.selected && !pe.tinyId).map(priorElt => {
            let url = ITEM_MAP[priorElt.elementType][priorElt.isDraft ? 'apiDraftById' : 'apiById'] + priorElt._id;
            return this.http.get<History>(url).toPromise().then(res => {
                res.url = ITEM_MAP[res.elementType].viewById + res._id;
                res.selected = true;
                this.priorElements[this.priorElements.indexOf(priorElt)] = res;
            });
        })).then(() => {
            this.newer = this.priorElements.filter(p => p.selected)[0];
            this.older = this.priorElements.filter(p => p.selected)[1];
            this.compareHistoryModal.open();
        }, err => this.alert.addAlert('danger', 'Error open history compare modal.' + err));
    }

}
