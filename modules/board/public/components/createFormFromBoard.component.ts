import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { FormService } from 'nativeRender/form.service';
import { CdeForm, FormSection } from 'shared/form/form.model';
import { Board, BoardDe, Definition, Designation } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-create-form-from-board',
    templateUrl: './createFormFromBoard.component.html'
})
export class CreateFormFromBoardComponent {
    @Input() board!: Board;
    @ViewChild('createFormContent', {static: true}) createFormContent!: TemplateRef<any>;
    elt!: CdeForm;
    modalRef!: MatDialogRef<TemplateRef<any>>;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog) {}

    openCreateFormModal() {
        this.http.get<BoardDe>('/server/board/' + this.board.id + '/0/500').subscribe(
            res => {
                if (res.elts.length > 0) {
                    this.elt = new CdeForm();
                    this.elt.classification = [];
                    this.elt.designations.push(new Designation(this.board.name));
                    this.elt.definitions.push(new Definition());
                    this.elt.formElements.push(new FormSection());
                    res.elts.forEach((p: DataElement) => {
                        FormService.convertCdeToQuestion(p, q => {
                            if (q) {
                                this.elt.formElements[0].formElements.push(q);
                            }
                        });
                    });
                    this.modalRef = this.dialog.open(this.createFormContent, {width: '1200px'});
                } else {
                    this.alert.addAlert('danger', 'No elements in board.');
                }
            }, err => this.alert.addAlert('danger', 'Error on load elements in board ' + err)
        );
    }

}
