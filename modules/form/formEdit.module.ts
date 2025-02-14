import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
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
import { TreeModule } from '@ali-hm/angular-tree-component';
import { HotkeyModule } from 'angular2-hotkeys';
import { CdeModule } from 'cde/cde.module';
import { CdeSearchModule } from 'cde/cdeSearch.module';
import { CompareModule } from 'compare/compare.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
import { FormSearchModule } from 'form/formSearch.module';
import { FormDescriptionQuestionDetailComponent } from 'form/formDescriptionQuestionDetail/formDescriptionQuestionDetail.component';
import { FormDescriptionSectionComponent } from 'form/formDescriptionSection/formDescriptionSection.component';
import { QuestionAnswerEditContentComponent } from 'form/questionAnswerEditContent/questionAnswerEditContent.component';
import { SelectQuestionLabelComponent } from 'form/selectQuestionLabel/selectQuestionLabel.component';
import { FormDescriptionQuestionComponent } from 'form/formDescriptionQuestion/formDescriptionQuestion.component';
import { FormDescriptionComponent } from 'form/formDescription/formDescription.component';
import { FormUpdateCdeVersionModalComponent } from 'form/form-update-cde-version-modal/form-update-cde-version-modal.component';
import { FormSearchModalComponent } from 'form/form-search-modal/form-search-modal.component';
import { QuestionSearchModalComponent } from 'form/question-search-modal/question-search-modal.component';
import { FormUpdateFormVersionModalComponent } from 'form/form-update-form-version-modal/form-update-form-version-modal.component';
import { SkipLogicValidateService } from 'form/skipLogicValidate.service';
import { UcumService } from 'form/ucum.service';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { NonCoreModule } from 'non-core/noncore.module';
import { SkipLogicModule } from 'skipLogic/skipLogic.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';
import { TagModule } from 'tag/tag.module';
import { CdeSearchComponent } from 'cde/search/cdeSearch.component';
import { DeCompletionComponent } from '../cde/completion/deCompletion.component';

const appRoutes: Routes = [{ path: '', component: FormDescriptionComponent }];

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
        CdeSearchComponent,
        DeCompletionComponent,
    ],
    declarations: [
        FormDescriptionComponent,
        FormSearchModalComponent,
        QuestionSearchModalComponent,
        FormDescriptionQuestionComponent,
        FormUpdateCdeVersionModalComponent,
        FormUpdateFormVersionModalComponent,
        FormDescriptionQuestionDetailComponent,
        FormDescriptionSectionComponent,
        QuestionAnswerEditContentComponent,
        SelectQuestionLabelComponent,
    ],
    exports: [],
    providers: [SkipLogicValidateService, UcumService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormEditModule {}
