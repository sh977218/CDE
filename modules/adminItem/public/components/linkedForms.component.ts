import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { CdeForm } from 'shared/form/form.model';
import { ElasticService } from '_app/elastic.service';
import { FormSummaryListContentComponent } from 'form/public/components/listView/formSummaryListContent.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-linked-forms',
    templateUrl: './linkedForms.component.html'
})

export class LinkedFormsComponent {
    @Input() public elt: any;
    @ViewChild("linkedFormsContent") public linkedFormsContent: TemplateRef<any>;

    forms: CdeForm[];
    formSummaryContentComponent = FormSummaryListContentComponent;

    constructor(private elasticService: ElasticService,
                public dialog: MatDialog) {}

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
                this.dialog.open(this.linkedFormsContent);
            }, 0);
        });
    }

    viewLinkedForms() {
        window.open("/form/search?q=" + this.elt.tinyId, "_blank");
    }

}