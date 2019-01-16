import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CoreModule } from 'core/core.module';
import { MatIconModule, MatInputModule, MatAutocompleteModule } from '@angular/material';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { SkipLogicAutocompleteComponent } from 'skipLogicAutocomplete/skipLogicAutocomplete.component';
import { QuestionAutocompleteComponent } from 'skipLogicAutocomplete/questionAutocomplete/questionAutocomplete.component';
import { OperatorAutocompleteComponent } from 'skipLogicAutocomplete/operatorAutocomplete/operatorAutocomplete.component';
import { AnswerAutocompleteComponent } from 'skipLogicAutocomplete/answerAutocomplete/answerAutocomplete.component';
import { LogicAutocompleteComponent } from 'skipLogicAutocomplete/logicAutocomplete/logicAutocomplete.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        CoreModule,
        MatIconModule,
        MatInputModule,
        MatAutocompleteModule
    ],
    declarations: [
        QuestionAutocompleteComponent,
        OperatorAutocompleteComponent,
        AnswerAutocompleteComponent,
        LogicAutocompleteComponent,
        SkipLogicAutocompleteComponent
    ],
    entryComponents: [
        QuestionAutocompleteComponent,
        OperatorAutocompleteComponent,
        AnswerAutocompleteComponent,
        LogicAutocompleteComponent,
        SkipLogicAutocompleteComponent
    ],
    exports: [SkipLogicAutocompleteComponent
    ],
    providers: [SkipLogicValidateService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SkipLogicAutocompleteModule {
}
