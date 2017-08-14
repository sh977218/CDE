import { Component, Inject, Input, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from '@ng-bootstrap/ng-bootstrap';
import { CdeForm } from 'form/public/form.model';
import { ElasticService } from 'core/public/elastic.service';
import { FormSummaryListContentComponent } from 'form/public/components/listView/formSummaryListContent.component';

@Component({
    selector: 'cde-linked-forms',
    providers: [NgbActiveModal],
    templateUrl: './linkedForms.component.html'
})

export class LinkedFormsComponent {
    @Input() public elt: any;
    @ViewChild("linkedFormsContent") public linkedFormsContent: NgbModalModule;

    forms: CdeForm[];
    formSummaryContentComponent = FormSummaryListContentComponent;
    modalRef: NgbModalRef;

    constructor(private elasticService: ElasticService,
                public modalService: NgbModal) {};

    getFormText () {
        if (!this.forms || this.forms.length === 0) {
            return 'There are no forms that use this ' + this.elt.elementType;
        }
        else if (this.forms.length === 1) {
            return 'There is 1 form that uses this ' + this.elt.elementType;
        }
        else if (this.forms.length >= 20) {
            return 'There are more than 20 forms that use this ' + this.elt.elementType;
        }
        else {
            return 'There are ' + this.forms.length + ' forms that use this ' + this.elt.elementType;
        }
    }

    openLinkedFormsModal() {
        let searchSettings = this.elasticService.defaultSearchSettings;
        searchSettings.q = '"' + this.elt.tinyId + '"';
        this.elasticService.generalSearchQuery(this.elasticService.buildElasticQuerySettings(searchSettings), 'form', (err, result) => {
            if (err) return;
            this.forms = result.forms.filter(f => {
                 return f.tinyId !== this.elt.tinyId;
            });
            setTimeout(() => {
                this.modalRef = this.modalService.open(this.linkedFormsContent, {size: "lg"});
            }, 0);
        });
    }

}