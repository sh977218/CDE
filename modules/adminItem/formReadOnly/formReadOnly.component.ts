import { Component, Input } from '@angular/core';
import { CdeForm, CopyrightURL } from 'shared/form/form.model';

@Component({
    selector: 'cde-form-readonly[form]',
    templateUrl: './formReadOnly.component.html',
})
export class FormReadOnlyComponent {
    @Input() form!: CdeForm;

    trackByUrl(index: number, url: CopyrightURL) {
        return url.url;
    }
}
