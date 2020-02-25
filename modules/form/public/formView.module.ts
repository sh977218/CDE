import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeModule } from 'angular-tree-component';
import 'angular-tree-component/dist/angular-tree-component.css';
import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { HotkeyModule } from 'angular2-hotkeys';
import { BoardModule } from 'board/public/board.module';
import { CdeModule } from 'cde/public/cde.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { CompareModule } from 'compare/compare.module';
import { DiscussModule } from 'discuss/discuss.module';
import { ArrayListPipe } from 'form/public/arrayList.pipe';
import { FormViewComponent } from 'form/public/components/formView.component';
import { FormViewService } from 'form/public/components/formView.service';
import { FormSearchModule } from 'form/public/formSearch.module';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { DisplayProfileComponent } from 'form/public/components/displayProfile/displayProfile.component';
import { FhirProcedureMappingComponent } from 'form/public/components/fhir/fhirProcedureMapping.component';
import { FormClassificationComponent } from 'form/public/components/formClassification/formClassification.component';
import { FormGeneralDetailsComponent } from 'form/public/components/formGeneralDetails/formGeneralDetails.component';
import { FormTermMappingComponent } from 'form/public/components/formTermMapping/formTermMapping.component';
import { FormDescriptionComponent } from 'form/public/tabs/description/formDescription.component';
import { FormDescriptionQuestionComponent } from 'form/public/tabs/description/formDescriptionQuestion.component';
import { FormDescriptionSectionComponent } from 'form/public/tabs/description/formDescriptionSection.component';
import { FormDescriptionQuestionDetailComponent } from 'form/public/tabs/description/formDescriptionQuestionDetail.component';
import { QuestionAnswerEditContentComponent } from 'form/public/tabs/description/questionAnswerEditContent.component';
import { SelectQuestionLabelComponent } from 'form/public/tabs/description/selectQuestionLabel.component';
import { NativeRenderFullComponent } from 'form/public/tabs/general/nativeRenderFull.component';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { NonCoreModule } from 'non-core/noncore.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
import { TagModule } from 'tag/tag.module';
import { SkipLogicModule } from 'skipLogic/skipLogic.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

const appRoutes: Routes = [
    {path: '', component: FormViewComponent},
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
        TreeModule.forRoot(),
        // non-core
        NonCoreModule,

        // internal
        TagModule,
        AdminItemModule,
        DeleteWithConfirmModule,
        InlineAreaEditModule,
        InlineEditModule,
        InlineSelectEditModule,
        SortableArrayModule,
        BoardModule,
        CdeModule,
        CdeSearchModule,
        CompareModule,
        DiscussModule,
        FormSearchModule,
        NativeRenderModule,
        SkipLogicModule,
    ],
    declarations: [
        ArrayListPipe,
        DisplayProfileComponent,
        FormViewComponent,
        FormClassificationComponent,
        FormDescriptionComponent,
        FormDescriptionQuestionComponent,
        FormDescriptionQuestionDetailComponent,
        FormDescriptionSectionComponent,
        FormGeneralDetailsComponent,
        FormTermMappingComponent,
        FhirProcedureMappingComponent,
        NativeRenderFullComponent,
        QuestionAnswerEditContentComponent,
        SelectQuestionLabelComponent
    ],
    entryComponents: [
        QuestionAnswerEditContentComponent,
        SelectQuestionLabelComponent,
        FhirProcedureMappingComponent
    ],
    exports: [],
    providers: [
        FormViewService,
        SkipLogicValidateService,
        UcumService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class FormViewModule {
}
