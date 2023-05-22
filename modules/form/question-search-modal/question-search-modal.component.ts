import { AfterViewChecked, Component, ElementRef, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DataElement } from 'shared/de/dataElement.model';
import { DeCompletionService } from 'cde/completion/deCompletion.service';
import { Designation } from 'shared/models.model';

@Component({
    templateUrl: './question-search-modal.component.html',
    providers: [DeCompletionService],
})
export class QuestionSearchModalComponent implements AfterViewChecked {
    @ViewChild('searchElement') searchElement!: ElementRef;
    @Output() selectedQuestion = new EventEmitter();
    newDataElement = new DataElement();
    questionModelMode = 'search';

    constructor(
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: { questionModelMode: string },
        private dialogRef: MatDialogRef<QuestionSearchModalComponent>,
        public deCompletionService: DeCompletionService
    ) {
        this.newDataElement.designations.push(new Designation('', ['Question Text']));
        this.deCompletionService.suggestedCdes = [];
        if (data.questionModelMode) {
            this.questionModelMode = data.questionModelMode;
        }
    }

    addQuestionFromSearch(de: DataElement) {
        this.selectedQuestion.emit(de);
    }

    createNewDataElement(newCde: DataElement = this.newDataElement) {
        this.selectedQuestion.emit(newCde);
        this.dialogRef.close();
    }

    ngAfterViewChecked(): void {
        setTimeout(() => {
            if (this.searchElement) {
                this.searchElement.nativeElement.focus();
            }
        }, 0);
    }
}
