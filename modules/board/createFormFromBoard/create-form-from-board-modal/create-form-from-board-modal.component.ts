import { Component, Inject } from '@angular/core';
import { BoardDe, Definition, Designation } from 'shared/models.model';
import { CdeForm, FormSection } from 'shared/form/form.model';
import { DataElement } from 'shared/de/dataElement.model';
import { convertCdeToQuestion } from 'nativeRender/form.service';
import { AlertService } from 'alert/alert.service';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    templateUrl: './create-form-from-board-modal.component.html'
})
export class CreateFormFromBoardModalComponent {
    elt: CdeForm = new CdeForm();

    constructor(@Inject(MAT_DIALOG_DATA) public board,
        public dialogRef: MatDialogRef<CreateFormFromBoardModalComponent>,
                private alert: AlertService,
                private http: HttpClient) {
        this.http.get<BoardDe>('/server/board/' + board.id + '/0/500')
            .subscribe(
                res => {
                    if (res.elts.length > 0) {
                        this.elt = new CdeForm();
                        this.elt.classification = [];
                        this.elt.designations.push(new Designation(board.name));
                        this.elt.definitions.push(new Definition());
                        this.elt.formElements.push(new FormSection());
                        res.elts.forEach((p: DataElement) => {
                            convertCdeToQuestion(p, q => {
                                if (q) {
                                    this.elt.formElements[0].formElements.push(q);
                                }
                            });
                        });
                    } else {
                        this.alert.addAlert('danger', 'No elements in board.');
                    }
                }, err => this.alert.addAlert('danger', 'Error on load elements in board ' + err)
            );
    }

}
