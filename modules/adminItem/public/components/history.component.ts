import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
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
                private http: Http,
                public modalService: NgbModal) {
    }

    ngOnInit(): void {
        this.elt.viewing = true;
        delete this.elt.selected;
        if (this.elt.history && this.elt.history.length > 0) {
            this.http.get(
                this.elt.elementType === 'cde'
                    ? '/deById/' + this.elt._id + '/priorDataElements'
                    : '/formById/' + this.elt._id + '/priorForms'
            ).map(res => res.json()).subscribe(res => {
                this.priorElements = res.reverse();
                this.priorElements.splice(0, 0, this.elt);
                this.priorElements.forEach(pe => {
                    pe.url = URL_MAP[this.elt.elementType] + pe._id;
                });
            }, err => this.alert.addAlert('danger', 'Error retrieving history: ' + err));
        } else {
            this.priorElements = [this.elt];
        }
    }

    selectRow(priorCde) {
        if (this.numberSelected === 2 && !priorCde.selected) {
            priorCde.selected = false;
        } else if (this.numberSelected === 2 && priorCde.selected) {
            priorCde.selected = false;
            this.numberSelected--;
        } else {
            priorCde.selected = !priorCde.selected;
            if (priorCde.selected) this.numberSelected++;
            else this.numberSelected--;
        }
    }

    openHistoryCompareModal() {
        this.modalRef = this.modalService.open(this.compareContent, {size: 'lg'});
    }

    getSelectedElt() {
        return this.priorElements.filter(p => p.selected);
    }

}
