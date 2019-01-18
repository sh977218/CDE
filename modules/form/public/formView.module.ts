import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
    MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDialogModule,
    MatExpansionModule, MatGridListModule, MatIconModule, MatInputModule, MatMenuModule, MatSelectModule,
    MatSliderModule, MatTabsModule, MatTooltipModule, MatAutocompleteModule
} from "@angular/material";
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
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
import { CoreModule } from 'core/core.module';


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
        NgSelectModule,
        RouterModule.forChild(appRoutes),
        TreeModule.forRoot(),
        // core
        CoreModule,

        // internal
        AdminItemModule,
        BoardModule,
        CdeModule,
        CdeSearchModule,
        CompareModule,
        DiscussModule,
        FormSearchModule,
        NativeRenderModule
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
