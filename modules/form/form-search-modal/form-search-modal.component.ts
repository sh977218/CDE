import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { fetchForm } from 'nativeRender/form.service';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';

@Component({
    templateUrl: './form-search-modal.component.html',
})
export class FormSearchModalComponent {
    @Output() selectedForm = new EventEmitter<CdeForm>();

    constructor(public http: HttpClient) {}

    addFormFromSearch(form: CdeFormElastic) {
        fetchForm(form.tinyId).then(form => this.selectedForm.emit(form));
    }
}
