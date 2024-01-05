import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, Component, ElementRef, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeCompletionService } from 'cde/completion/deCompletion.service';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';

@Component({
    templateUrl: './question-search-modal.component.html',
    providers: [DeCompletionService],
})
export class QuestionSearchModalComponent implements AfterViewChecked {
    @ViewChild('searchElement') searchElement!: ElementRef;
    @Output() selectedQuestion: EventEmitter<DataElementElastic> = new EventEmitter();
    newDataElement: DataElementElastic = new DataElement() as DataElementElastic;
    questionModelMode = 'search';

    constructor(
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: { questionModelMode: string },
        private dialogRef: MatDialogRef<QuestionSearchModalComponent>,
        public deCompletionService: DeCompletionService
    ) {
        this.newDataElement.designations.push({ designation: '', tags: ['Question Text'] });
        this.deCompletionService.suggestedCdes = [];
        if (data.questionModelMode) {
            this.questionModelMode = data.questionModelMode;
        }
    }

    addQuestionFromSearch(de: DataElementElastic) {
        this.selectedQuestion.emit(de);
    }

    createNewDataElement(newCde: DataElementElastic = this.newDataElement) {
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
