import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
import { FormService } from 'nativeRender/form.service';
import { Definition, Designation } from 'shared/models.model';
import { CdeForm, FormSection } from 'shared/form/form.model';

@Component({
    selector: 'cde-create-form-from-board',
    templateUrl: './createFormFromBoard.component.html'
})
export class CreateFormFromBoardComponent {
    @Input() board: any;
    @ViewChild('createFormContent') public createFormContent: NgbModalModule;
    elt: CdeForm;
    modalRef: NgbModalRef;

    constructor(private alert: AlertService,
                private formService: FormService,
                private http: HttpClient,
                public modalService: NgbModal) {
    }

    openCreateFormModal() {
        if (this.board.pins && this.board.pins.length > 0) {
            this.elt = new CdeForm();
            this.elt.designations.push(new Designation(this.board.name));
            this.elt.definitions.push(new Definition());
            this.elt.formElements.push(new FormSection());
            this.http.get<any>('/board/' + this.board._id + '/0/500').subscribe(
                res => {
                    res.elts.forEach(p => {
                        this.formService.convertCdeToQuestion(p, q => {
                            this.elt.formElements[0].formElements.push(q);
                        });
                    });
                    this.modalRef = this.modalService.open(this.createFormContent, {size: 'lg'});
                }, err => this.alert.addAlert('danger', 'Error on load elements in board ' + err)
            );
        }
    }
}
