import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterModule, Routes } from '@angular/router';
import { TreeModule } from "angular-tree-component";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { BoardModule } from "board/public/board.module";
import { CdeModule } from "cde/public/cde.module";
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { SearchModule } from "search/search.module";
import { WidgetModule } from "widget/widget.module";

import { ArrayListPipe } from "./arrayList.pipe";
import { BoardFormSummaryListComponent } from "./components/listView/boardFormSummaryList.component";
import { BoardFormSummaryListContentComponent } from "./components/listView/boardFormSummaryListContent.component";
import { FormAccordionListComponent } from "./components/listView/formAccordionList.component";
import { FormDescriptionComponent } from "./tabs/description/formDescription.component";
import { FormDescriptionQuestionComponent } from "./tabs/description/formDescriptionQuestion.component";
import { FormDescriptionQuestionDetailComponent } from "./tabs/description/formDescriptionQuestionDetail.component";
import { FormDescriptionSectionComponent } from "./tabs/description/formDescriptionSection.component";
import { FormSearchComponent } from "./components/search/formSearch.component";
import { FormSummaryListContentComponent } from "./components/listView/formSummaryListContent.component";
import { QuickBoardFormSummaryListContentComponent } from 'form/public/components/listView/quickBoardFormSummaryListContent.component';

import { FormService } from "nativeRender/form.service";
import { SkipLogicService } from "nativeRender/skipLogic.service";
import { FormGeneralDetailsComponent } from "./components/formGeneralDetails/formGeneralDetails.component";
import { DisplayProfileComponent } from "./components/displayProfile/displayProfile.component";
import { FormTermMappingComponent } from "./components/formTermMapping/formTermMapping.component";
import { FormViewComponent } from "./components/formView.component";
import { DiscussModule } from "discuss/discuss.module";
import { CreateFormComponent } from 'form/public/components/createForm.component';
import { FormClassificationComponent } from "./components/formClassification/formClassification.component";
import { NativeRenderFullComponent } from 'form/public/nativeRender/nativeRenderFull.component';

const appRoutes: Routes = [
    {path: 'form/search', component: FormSearchComponent},
    {path: 'form', component: FormSearchComponent},
    {path: 'formView', component: FormViewComponent},
    {path: 'createForm', component: CreateFormComponent},
];


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        Select2Module,
        // internal
        TreeModule,
        AdminItemModule,
        BoardModule,
        CdeModule,
        NativeRenderModule,
        SearchModule,
        WidgetModule,
        DiscussModule,
    ],
    declarations: [
        ArrayListPipe,
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        DisplayProfileComponent,
        FormViewComponent,
        FormAccordionListComponent,
        FormClassificationComponent,
        FormDescriptionComponent,
        FormDescriptionQuestionComponent,
        FormDescriptionQuestionDetailComponent,
        FormDescriptionSectionComponent,
        FormGeneralDetailsComponent,
        FormSearchComponent,
        FormSummaryListContentComponent,
        FormTermMappingComponent,
        NativeRenderFullComponent,
        QuickBoardFormSummaryListContentComponent,
    ],
    entryComponents: [
        CreateFormComponent,
        DisplayProfileComponent,
        FormViewComponent,
        FormAccordionListComponent,
        FormDescriptionComponent,
        FormGeneralDetailsComponent,
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        FormDescriptionComponent,
        FormSearchComponent,
        FormSummaryListContentComponent,
        NativeRenderFullComponent,
        QuickBoardFormSummaryListContentComponent,
    ],
    exports: [
        FormAccordionListComponent,
    ],
    providers: [
        FormService,
        SkipLogicService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
