import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { FormSummaryListContentComponent } from 'form/public/components/listView/formSummaryListContent.component';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { ElasticQueryResponseForm } from 'shared/models.model';
import { SearchSettings } from 'shared/search/search.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'cde-linked-forms',
    templateUrl: './linkedForms.component.html'
})

export class LinkedFormsComponent {
    @Input() elt!: DataElement;
    @ViewChild('linkedFormsContent', {static: true}) linkedFormsContent!: TemplateRef<any>;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    forms!: CdeForm[];
    formSummaryContentComponent = FormSummaryListContentComponent;

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
        this.elasticService.generalSearchQuery(this.elasticService.buildElasticQuerySettings(searchSettings), 'form',
            (err?: string, result?: ElasticQueryResponseForm) => {
            if (err || !result) { return; }
            this.forms = result.forms.filter(f => f.tinyId !== this.elt.tinyId);
            this.dialogRef = this.dialog.open(this.linkedFormsContent);
        });
    }

    viewLinkedForms() {
        window.open('/form/search?q=' + this.elt.tinyId, '_blank');
    }
}
