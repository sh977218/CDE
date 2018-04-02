import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';

const URL_MAP = {
    'cde': '/deView?cdeId=',
    'form': '/formView?formId='
};

@Component({
    selector: 'cde-history',
    templateUrl: './history.component.html',
    styles: [`
        caption {
            caption-side: top;
        }

        .color-box {
            width: 10px;
            height: 10px;
        }

        .isSelected {
            background-color: #f5f5f5;
        }

        #reorderIcon{
            background-color: #fad000;
        }
        #addIcon{
            background-color: #008000;
        }
        #removeIcon{
            background-color: #a94442;
        }
        #editIcon{
            background-color: #0000ff;
        }

    `],
    providers: [NgbActiveModal]
})
export class HistoryComponent implements OnInit {
    @ViewChild('compareContent') public compareContent: NgbModal;
    @Input() public elt: any;
    @Input() public canEdit: boolean = false;
    public modalRef: NgbActiveModal;
    showVersioned: boolean = false;
    public priorElements: any[];
    public numberSelected: number = 0;
    public filter = {
        reorder: {
            select: true
        },
        add: {
            select: true
        },
        remove: {
            select: true
        },
        edited: {
            select: true
        }
    };

    constructor(private alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal) {
    }

    ngOnInit(): void {
        this.elt.viewing = true;
        delete this.elt.selected;
        if (this.elt.history && this.elt.history.length > 0) {
            this.http.get<any[]>(
                this.elt.elementType === 'cde'
                    ? '/deById/' + this.elt._id + '/priorDataElements'
                    : '/formById/' + this.elt._id + '/priorForms'
            ).subscribe(res => {
                this.priorElements = res.reverse();
                this.priorElements.splice(0, 0, this.elt);
                this.priorElements.forEach(pe => pe.url = URL_MAP[this.elt.elementType] + pe._id);
            }, err => this.alert.httpErrorMessageAlert(err, 'Error retrieving history:'));
        } else {
            this.priorElements = [this.elt];
        }
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
            if (priorElt.selected && !priorElt.promise) {
                const prom = this.http.get(
                    this.elt.elementType === 'cde'
                        ? '/deById/' + priorElt._id
                        : '/formById/' + priorElt._id).toPromise();
                prom.then(res => {
                    this.priorElements[index] = res;
                    this.priorElements[index].url = URL_MAP[this.priorElements[index].elementType] +
                        this.priorElements[index]._id;
                    this.priorElements[index].promise = prom;
                    this.priorElements[index].selected = true;
                });
            }
        }
    }

    openHistoryCompareModal() {
        Promise.all(this.priorElements.filter(pe => !!pe.promise).map(pe => pe.promise)).then(() => {
            this.modalRef = this.modalService.open(this.compareContent, {size: 'lg'});
        });
    }

    getSelectedElt() {
        return this.priorElements.filter(p => p.selected);
    }
}
