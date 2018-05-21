import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeModule } from 'angular-tree-component';
import "angular-tree-component/dist/angular-tree-component.css";
import { NgSelectModule } from '@ng-select/ng-select';
import { HotkeyModule } from 'angular2-hotkeys';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { ArrayListPipe } from './arrayList.pipe';
import { BoardModule } from 'board/public/board.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { DiscussModule } from 'discuss/discuss.module';
import { DisplayProfileComponent } from './components/displayProfile/displayProfile.component';
import { FormClassificationComponent } from './components/formClassification/formClassification.component';
import { FormDescriptionComponent } from './tabs/description/formDescription.component';
import { FormDescriptionQuestionComponent } from './tabs/description/formDescriptionQuestion.component';
import { FormDescriptionQuestionDetailComponent } from './tabs/description/formDescriptionQuestionDetail.component';
import { FormDescriptionSectionComponent } from './tabs/description/formDescriptionSection.component';
import { FormGeneralDetailsComponent } from './components/formGeneralDetails/formGeneralDetails.component';
import { FormSearchModule } from 'form/public/formSearch.module';
import { FormTermMappingComponent } from './components/formTermMapping/formTermMapping.component';
import { FormViewComponent } from './components/formView.component';
import { NativeRenderFullComponent } from 'form/public/tabs/general/nativeRenderFull.component';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { QuestionAnswerEditContentComponent } from 'form/public/tabs/description/questionAnswerEditContent.component';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { WidgetModule } from 'widget/widget.module';
import { CompareModule } from 'compare/compare.module';
import { MatButtonModule, MatDialogModule } from "@angular/material";

const appRoutes: Routes = [
    {path: '', component: FormViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        NgSelectModule,
        HotkeyModule.forRoot(),
        TreeModule,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
        BoardModule,
        CdeSearchModule,
        CompareModule,
        DiscussModule,
        FormSearchModule,
        NativeRenderModule,
        MatButtonModule,
        MatDialogModule
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
        NativeRenderFullComponent,
        QuestionAnswerEditContentComponent
    ],
    entryComponents: [
        QuestionAnswerEditContentComponent
    ],
    exports: [],
    providers: [
        SkipLogicValidateService,
        UcumService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormViewModule {
}
