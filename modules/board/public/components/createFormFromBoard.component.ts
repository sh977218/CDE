import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert.service';
import { FormService } from 'nativeRender/form.service';
import { Definition, Designation } from 'shared/models.model';
import { CdeForm, FormSection } from 'shared/form/form.model';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'cde-create-form-from-board',
    templateUrl: './createFormFromBoard.component.html'
})
export class CreateFormFromBoardComponent {
    @Input() board: any;
    @ViewChild('createFormContent') public createFormContent: TemplateRef<any>;
    elt: CdeForm;
    modalRef: MatDialogRef<TemplateRef<any>>;

    constructor(private alert: AlertService,
                private formService: FormService,
                private http: HttpClient,
                public dialog: MatDialog) {}

    openCreateFormModal() {
        this.http.get<any>('/server/board/' + this.board.id + '/0/500').subscribe(
            res => {
                if (res.elts.length > 0) {
                    this.elt = new CdeForm();
                    this.elt.designations.push(new Designation(this.board.name));
                    this.elt.definitions.push(new Definition());
                    this.elt.formElements.push(new FormSection());
                    res.elts.forEach(p => {
                        this.formService.convertCdeToQuestion(p, q => {
                            this.elt.formElements[0].formElements.push(q);
                        });
                    });
                    this.modalRef = this.dialog.open(this.createFormContent, {width: '800'});
                } else this.alert.addAlert('danger', 'No elements in board.');
            }, err => this.alert.addAlert('danger', 'Error on load elements in board ' + err)
        );
    }

}
