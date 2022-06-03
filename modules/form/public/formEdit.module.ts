import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeModule } from '@circlon/angular-tree-component';
import { HotkeyModule } from 'angular2-hotkeys';
import { CdeModule } from 'cde/cde.module';
import { CdeSearchModule } from 'cde/cdeSearch.module';
import { CompareModule } from 'compare/compare.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { NonCoreModule } from 'non-core/noncore.module';
import { SkipLogicModule } from 'skipLogic/skipLogic.module';
import { FormDescriptionQuestionDetailComponent } from 'form/public/components/formDescriptionQuestionDetail/formDescriptionQuestionDetail.component';
import { FormDescriptionSectionComponent } from 'form/public/components/formDescriptionSection/formDescriptionSection.component';
import { QuestionAnswerEditContentComponent } from 'form/public/components/questionAnswerEditContent/questionAnswerEditContent.component';
import { SelectQuestionLabelComponent } from 'form/public/components/selectQuestionLabel/selectQuestionLabel.component';
import { FormDescriptionQuestionComponent } from 'form/public/components/formDescriptionQuestion/formDescriptionQuestion.component';
import { FormDescriptionComponent } from 'form/public/components/formDescription/formDescription.component';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatBadgeModule } from '@angular/material/badge';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { TagModule } from 'tag/tag.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';

const appRoutes: Routes = [
    {path: '', component: FormDescriptionComponent},
];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HotkeyModule.forRoot(),
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDialogModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatSliderModule,
        MatTabsModule,
        MatAutocompleteModule,
        MatTooltipModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        TreeModule,
        // non-core
        NonCoreModule,

        // internal
        CdeModule,
        CdeSearchModule,
        CompareModule,
        FormSearchModule,
        SkipLogicModule,
        CdkTreeModule,
        MatBadgeModule,
        InlineEditModule,
        InlineAreaEditModule,
        TagModule,
        DeleteWithConfirmModule,
        SortableArrayModule,
    ],
    declarations: [
        FormDescriptionComponent,
        FormDescriptionQuestionComponent,
        FormDescriptionQuestionDetailComponent,
        FormDescriptionSectionComponent,
        QuestionAnswerEditContentComponent,
        SelectQuestionLabelComponent
    ],
    exports: [],
    providers: [
        SkipLogicValidateService,
        UcumService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class FormEditModule {
}
