import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, ViewChild, EventEmitter, TemplateRef } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import _isEqual from 'lodash/isEqual';
import { iterateFormElements } from 'shared/form/fe';
import { MatDialog } from '@angular/material';
import { FormQuestion, QuestionCde } from 'shared/form/form.model';
import { Cb, Item } from 'shared/models.model';

export type SaveModalQuestionCde = QuestionCde & {
    datatype: string,
    designations: {invalid?: boolean, message?: string},
    isCollapsed?: boolean
};
export type SaveModalFormQuestion = FormQuestion & {question: {cde: SaveModalQuestionCde}};

@Component({
    selector: 'cde-save-modal',
    templateUrl: './saveModal.component.html'
})
export class SaveModalComponent {
    @Input() elt!: Item;
    @Output() save = new EventEmitter();
    @Output() eltChange = new EventEmitter();
    @ViewChild('updateElementContent', {static: true}) updateElementContent!: TemplateRef<any>;
    duplicatedVersion = false;
    protected newCdes: SaveModalQuestionCde[] = [];
    overrideVersion = false;

    constructor(private alert: AlertService,
                public http: HttpClient,
                public dialog: MatDialog) {}

    newVersionVersionUnicity(newVersion?: string) {
        if (!newVersion) { newVersion = this.elt.version; }
        this.http.get('/' + (this.elt.elementType === 'cde' ? 'de' : this.elt.elementType) + '/' + this.elt.tinyId + '/latestVersion/',
            {responseType: 'text'}).subscribe(
            (res: string) => {
                if (res && newVersion && _isEqual(res, newVersion)) {
                    this.duplicatedVersion = true;
                } else {
                    this.duplicatedVersion = false;
                    this.overrideVersion = false;
                }
            },
            (err: any) => this.alert.httpErrorMessageAlert(err)
        );
    }

    openSaveModal() {
        this.newCdes = [];
        this.newVersionVersionUnicity();
        if (this.elt.elementType === 'form' && this.elt.isDraft) {
            iterateFormElements(this.elt, {
                async: true,
                questionCb: (fe: SaveModalFormQuestion, cb?: Cb) => {
                    if (!fe.question.cde.tinyId) {
                        if (fe.question.cde.designations.length === 0) {
                            fe.question.cde.designations.invalid = true;
                            fe.question.cde.designations.message = 'no designation.';
                        } else {
                            fe.question.cde.designations.invalid = false;
                            fe.question.cde.designations.message = '';
                        }
                        this.newCdes.push(fe.question.cde);
                        if (cb) { cb(); }
                    } else if (cb) { cb(); }
                }
            }, () => {
                this.dialog.open(this.updateElementContent);
            });
        } else {
            this.dialog.open(this.updateElementContent);
        }
    }
}
