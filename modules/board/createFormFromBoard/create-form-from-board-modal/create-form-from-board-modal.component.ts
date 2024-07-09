import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { DataElementService } from 'cde/dataElement.service';
import { Board, BoardDe } from 'shared/models.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { DataElement, isElasticDataElementClipped } from 'shared/de/dataElement.model';
import { convertCdeToQuestion } from 'shared/form/fe';
import { CdeForm, FormSection } from 'shared/form/form.model';

@Component({
    templateUrl: './create-form-from-board-modal.component.html',
})
export class CreateFormFromBoardModalComponent {
    elt: CdeForm = new CdeForm();

    constructor(
        @Inject(MAT_DIALOG_DATA) public board: Board,
        public dialogRef: MatDialogRef<CreateFormFromBoardModalComponent>,
        private alert: AlertService,
        private http: HttpClient
    ) {
        this.elt = new CdeForm();
        this.elt.designations.push({ designation: board.name, tags: [], sources: [] });
        this.elt.definitions.push({ definition: '', tags: [], sources: [] });
        this.elt.formElements.push(new FormSection());
        this.http.get<BoardDe>('/server/board/' + board.id + '/0/500').subscribe(
            res => {
                if (res.elts.length > 0) {
                    res.elts.forEach(pin => {
                        if (isElasticDataElementClipped(pin)) {
                            DataElementService.fetchDe(pin.tinyId, pin.version || '').then(this.addQuestion, () => {
                                this.alert.addAlert('danger', pin.tinyId + ' is not found in the database.');
                            });
                        } else {
                            this.addQuestion(pin);
                        }
                    });
                } else {
                    this.alert.addAlert('danger', 'No elements in board.');
                }
            },
            err => this.alert.addAlert('danger', 'Error on load elements in board ' + err)
        );
    }

    addQuestion(de: DataElement) {
        const q = convertCdeToQuestion(de);
        if (q) {
            this.elt.formElements[0].formElements.push(q);
        }
    }
}
