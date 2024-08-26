import { Component, Inject } from '@angular/core';
import { CdeFormElastic, ElasticResponseDataForm } from 'shared/form/form.model';
import { SearchSettings } from 'shared/search/search.model';
import { Elt } from 'shared/models.model';
import { ElasticService } from '_app/elastic.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormSummaryListContentComponent } from 'form/listView/formSummaryListContent.component';

@Component({
    selector: 'cde-linked-forms-modal',
    templateUrl: './linked-form-modal.component.html',
})
export class LinkedFormModalComponent {
    forms!: CdeFormElastic[];
    formSummaryContentComponent = FormSummaryListContentComponent;

    constructor(
        @Inject(MAT_DIALOG_DATA) public elt: Elt,
        private dialogRef: MatDialogRef<LinkedFormModalComponent>,
        private elasticService: ElasticService
    ) {
        const tinyId = elt.tinyId;
        const searchSettings = new SearchSettings();
        searchSettings.q = `"${tinyId}"`;
        this.elasticService.generalSearchQuery(
            this.elasticService.buildElasticQuerySettings(searchSettings),
            'form',
            (err?: string, result?: ElasticResponseDataForm) => {
                if (err || !result) {
                    return;
                }
                this.forms = result.forms.filter(f => f.tinyId !== tinyId);
            }
        );
    }

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
}
