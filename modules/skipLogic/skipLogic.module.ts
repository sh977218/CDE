import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CoreModule } from 'core/core.module';
import {
    MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule,
    MatDialogModule
} from '@angular/material';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { SkipLogicAutocompleteComponent } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';
import { QuestionAutocompleteComponent } from 'skipLogic/questionAutocomplete/questionAutocomplete.component';
import { OperatorAutocompleteComponent } from 'skipLogic/operatorAutocomplete/operatorAutocomplete.component';
import { AnswerAutocompleteComponent } from 'skipLogic/answerAutocomplete/answerAutocomplete.component';
import { LogicAutocompleteComponent } from 'skipLogic/logicAutocomplete/logicAutocomplete.component';
import { SkipLogicComponent } from 'skipLogic/skipLogic.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        CoreModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDialogModule,
        MatAutocompleteModule
    ],
    declarations: [
        SkipLogicAutocompleteComponent,
        QuestionAutocompleteComponent,
        OperatorAutocompleteComponent,
        AnswerAutocompleteComponent,
        LogicAutocompleteComponent,
        SkipLogicComponent
    ],
    entryComponents: [
        SkipLogicAutocompleteComponent,
        QuestionAutocompleteComponent,
        OperatorAutocompleteComponent,
        AnswerAutocompleteComponent,
        LogicAutocompleteComponent,
        SkipLogicComponent
    ],
    exports: [SkipLogicComponent],
    providers: [SkipLogicValidateService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SkipLogicModule {
}