import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, ViewChild, EventEmitter, TemplateRef } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import * as _isEqual from 'lodash/isEqual';
import { iterateFormElements } from 'shared/form/fe';
import { MatDialog } from '@angular/material/dialog';
import { FormQuestion, QuestionCde } from 'shared/form/form.model';
import { Cb, Item } from 'shared/models.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export type SaveModalQuestionCde = QuestionCde & {
    datatype: string,
    designations: { invalid?: boolean, message?: string },
    isCollapsed?: boolean
};
export type SaveModalFormQuestion = FormQuestion & { question: { cde: SaveModalQuestionCde } };

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

    versionNumber$: Subject<string> = new Subject<string>();
    onChangeNote$: Subject<string> = new Subject<string>();

    constructor(private alert: AlertService,
                public http: HttpClient,
                public dialog: MatDialog) {
        this.versionNumber$.pipe(
            debounceTime(1000),
            distinctUntilChanged(),
        )
            .subscribe(versionNumber => {
                this.newVersionVersionUnicity(versionNumber);
            });
        this.onChangeNote$.pipe(
            debounceTime(1000),
            distinctUntilChanged(),
        )
            .subscribe(() => {
                this.eltChange.emit();
            });
    }

    onChangeNoteChanged(event: string) {
        this.onChangeNote$.next(event);
    }

    onVersionNumberChanged(event: string) {
        this.versionNumber$.next(event);
    }

    newVersionVersionUnicity(newVersion?: string) {
        if (!newVersion) {
            newVersion = this.elt.version;
        }
        let url = '/api/de/' + this.elt.tinyId + '/latestVersion/';
        if (this.elt.elementType === 'form') {
            url = '/api/form/' + this.elt.tinyId + '/latestVersion/';
        }
        this.http.get(url, {responseType: 'text'}).subscribe(
            (res: string) => {
                if (res && newVersion && _isEqual(res, newVersion)) {
                    this.duplicatedVersion = true;
                } else {
                    this.duplicatedVersion = false;
                    this.overrideVersion = false;
                }
                this.eltChange.emit()
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
                        if (cb) {
                            cb();
                        }
                    } else if (cb) {
                        cb();
                    }
                }
            }, () => {
                this.dialog.open(this.updateElementContent);
            });
        } else {
            this.dialog.open(this.updateElementContent);
        }
    }
}
