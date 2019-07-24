import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ElasticService } from '_app/elastic.service';
import { FormSummaryListContentComponent } from 'form/public/components/listView/formSummaryListContent.component';
import { CdeForm } from 'shared/form/form.model';
import { ElasticQueryResponse } from 'shared/models.model';
import { SearchSettings } from 'search/search.model';

@Component({
    selector: 'cde-linked-forms',
    templateUrl: './linkedForms.component.html'
})

export class LinkedFormsComponent {
    @Input() public elt: any;
    @ViewChild('linkedFormsContent') public linkedFormsContent: TemplateRef<any>;

    forms: CdeForm[];
    formSummaryContentComponent = FormSummaryListContentComponent;
    dialogRef: MatDialogRef<TemplateRef<any>>;

    constructor(private elasticService: ElasticService,
                public dialog: MatDialog) {}

    getFormText() {
        if (!this.forms || this.forms.length === 0) {
            return 'There are no forms that use this ' + this.elt.elementType;
        } else if (this.forms.length === 1) {
            return 'There is 1 form that uses this ' + this.elt.elementType;
        } else if (this.forms.length >= 20) {
            return 'There are more than 20 forms that use this ' + this.elt.elementType;
        } else {
            return 'There are ' + this.forms.length + ' forms that use this ' + this.elt.elementType;
        }
    }

    openLinkedFormsModal() {
        const searchSettings = new SearchSettings();
        searchSettings.q = '"' + this.elt.tinyId + '"';
        this.elasticService.generalSearchQuery(this.elasticService.buildElasticQuerySettings(searchSettings), 'form', (err?: string, result?: ElasticQueryResponse) => {
            if (err) { return; }
            this.forms = result.forms.filter(f => f.tinyId !== this.elt.tinyId);
            this.dialogRef = this.dialog.open(this.linkedFormsContent);
        });
    }

    viewLinkedForms() {
        window.open('/form/search?q=' + this.elt.tinyId, '_blank');
    }

}
