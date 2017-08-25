import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component";
import { Select2Module } from "ng2-select2";
import { NouisliderModule } from 'ng2-nouislider';

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { BoardModule } from "board/public/board.module";
import { CdeModule } from "cde/public/cde.module";
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
import { NativeRenderComponent } from "./nativeRender/nativeRender.component";
import { NativeRenderFullComponent } from "./nativeRender/nativeRenderFull.component";
import { NativeSectionComponent } from "./nativeRender/nativeSection.component";
import { NativeSectionMatrixComponent } from "./nativeRender/nativeSectionMatrix.component";
import { NativeQuestionComponent } from "./nativeRender/nativeQuestion.component";
import { NativeTableComponent } from "./nativeRender/nativeTable.component";
import { QuickBoardFormSummaryListContentComponent } from 'form/public/components/listView/quickBoardFormSummaryListContent.component';

import { FormService } from "./form.service";
import { SkipLogicService } from "./skipLogic.service";
import { FormGeneralDetailsComponent } from "./components/formGeneralDetails/formGeneralDetails.component";
import { DisplayProfileComponent } from "./components/displayProfile/displayProfile.component";
import { FormTermMappingComponent } from "./components/formTermMapping/formTermMapping.component";
import { FormViewComponent } from "./components/formView.component";
import { DiscussModule } from "../../discuss/discuss.module";
import { CreateFormComponent } from 'form/public/components/createForm.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        NouisliderModule,
        Select2Module,
        TreeModule,
        // internal
        AdminItemModule,
        BoardModule,
        CdeModule,
        SearchModule,
        WidgetModule,
        DiscussModule
    ],
    declarations: [
        ArrayListPipe,
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        DisplayProfileComponent,
        FormViewComponent,
        FormAccordionListComponent,
        FormDescriptionComponent,
        FormDescriptionQuestionComponent,
        FormDescriptionQuestionDetailComponent,
        FormDescriptionSectionComponent,
        FormGeneralDetailsComponent,
        FormSearchComponent,
        FormSummaryListContentComponent,
        FormTermMappingComponent,
        NativeRenderFullComponent,
        NativeRenderComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeQuestionComponent,
        NativeTableComponent,
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
        NativeRenderComponent,
        QuickBoardFormSummaryListContentComponent,
        NativeRenderFullComponent,
    ],
    exports: [
        FormAccordionListComponent,
        NativeRenderComponent,
    ],
    providers: [
        FormService,
        SkipLogicService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
