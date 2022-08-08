import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { CdeForm } from 'shared/form/form.model';
import { HttpClient } from '@angular/common/http';

@Component({
    templateUrl: './form-search-modal.component.html',
})
export class FormSearchModalComponent {
    @Output() selectedForm = new EventEmitter();

    constructor(public http: HttpClient) {
    }

    addFormFromSearch(form: CdeForm) {
        this.http.get<CdeForm>('/api/form/' + form.tinyId)
            .subscribe(form => {
                this.selectedForm.emit(form);
            });
    }
}
