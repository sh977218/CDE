import { HttpClient } from '@angular/common/http';
import { Component, Input, Output, ViewChild, EventEmitter, TemplateRef } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import * as _isEqual from 'lodash/isEqual';
import { iterateFormElements } from 'shared/form/fe';
import { MatDialog } from '@angular/material/dialog';
import { FormQuestionDraft, Question } from 'shared/form/form.model';
import { Cb, Item } from 'shared/models.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

type NewQuestion = FormQuestionDraft['question'] & {
    isCollapsed?: boolean;
    cde: {
        newCde: FormQuestionDraft['question']['cde']['newCde'];
    };
}

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
    newQuestions: NewQuestion[] = [];
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
        this.newQuestions = [];
        this.newVersionVersionUnicity();
        if (this.elt.elementType === 'form' && this.elt.isDraft) {
            iterateFormElements(this.elt, {
                async: true,
                questionCb: (fe: FormQuestionDraft, cb?: Cb) => {
                    if (fe.question.cde.newCde) {
                        this.newQuestions.push(fe.question as NewQuestion);
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