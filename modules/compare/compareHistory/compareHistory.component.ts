import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CompareService } from 'core/compare.service';
import { ClassificationService } from 'core/classification.service';

@Component({
    selector: "cde-compare-history",
    templateUrl: "./compareHistory.component.html",
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
export class CompareHistoryComponent implements OnInit {

    @Input() older;
    @Input() newer;
    @ViewChild('compareContent') public compareContent: NgbModal;
    public modalRef: NgbActiveModal;

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

    constructor(public modalService: NgbModal,
                public compareService: CompareService,
                public ClassificationService: ClassificationService) {
    }

    ngOnInit(): void {
    }

    openHistoryCompareModal() {
        this.modalRef = this.modalService.open(this.compareContent, {size: 'lg'});
    }
}