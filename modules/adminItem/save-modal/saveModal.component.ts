import { HttpClient } from '@angular/common/http';
import { Component, Output, EventEmitter, Inject } from '@angular/core';
import { isEqual } from 'lodash';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { iterateFormElements } from 'shared/form/fe';
import { FormQuestionDraft } from 'shared/form/form.model';
import { Item, ITEM_MAP } from 'shared/item';
import { Cb } from 'shared/models.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

type NewQuestion = FormQuestionDraft['question'] & {
    isCollapsed?: boolean;
    cde: {
        newCde: FormQuestionDraft['question']['cde']['newCde'];
    };
};

@Component({
    templateUrl: './saveModal.component.html',
})
export class SaveModalComponent {
    @Output() eltChange = new EventEmitter();

    duplicatedVersion = false;
    newQuestions: NewQuestion[] = [];
    overrideVersion = false;

    versionNumber$: Subject<string> = new Subject<string>();
    onChangeNote$: Subject<string> = new Subject<string>();

    constructor(
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public elt: Item,
        public dialog: MatDialog,
        private alert: AlertService
    ) {
        this.newVersionVersionUnicity();
        if (this.elt.elementType === 'form' && this.elt.isDraft) {
            iterateFormElements(
                this.elt,
                {
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
                    },
                },
                () => {}
            );
        }

        this.versionNumber$.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(versionNumber => {
            this.newVersionVersionUnicity(versionNumber);
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
        this.http
            .get(ITEM_MAP[this.elt.elementType].api + this.elt.tinyId + '/latestVersion/', { responseType: 'text' })
            .subscribe(
                (res: string) => {
                    if (res && newVersion && isEqual(res, newVersion)) {
                        this.duplicatedVersion = true;
                    } else {
                        this.duplicatedVersion = false;
                        this.overrideVersion = false;
                    }
                    this.eltChange.emit();
                },
                (err: any) => this.alert.httpErrorAlert(err)
            );
    }
}
