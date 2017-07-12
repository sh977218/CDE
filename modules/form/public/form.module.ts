import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component";
import { Select2Module } from "ng2-select2";
import { SortableModule } from "ngx-bootstrap";
import { NouisliderModule } from 'ng2-nouislider';

import { AdminItemModule } from "../../adminItem/public/adminItem.module";
import { BoardModule } from "../../board/public/board.module";
import { SearchModule } from "search";
import { WidgetModule } from "../../widget/widget.module";

import { ArrayListPipe } from "./arrayList.pipe";
import { BoardFormSummaryListComponent } from "./components/searchResults/boardFormSummaryList.component";
import { BoardFormSummaryListContentComponent } from "./components/searchResults/boardFormSummaryListContent.component";
import { CdeSortableComponent } from "./components/mergeForm/cdeSortable.component";
import { FormDescriptionComponent } from "./tabs/description/formDescription.component";
import { FormDescriptionQuestionComponent } from "./tabs/description/formDescriptionQuestion.component";
import { FormDescriptionQuestionDetailComponent } from "./tabs/description/formDescriptionQuestionDetail.component";
import { FormDescriptionSectionComponent } from "./tabs/description/formDescriptionSection.component";
import { FormSearchDirective, QuestionSearchDirective } from "./upgrade-components";
import { FormSummaryListComponent } from "./components/searchResults/formSummaryList.component";
import { FormSummaryListContentComponent } from "./components/searchResults/formSummaryListContent.component";
import { MergeFormComponent } from "./components/mergeForm/mergeForm.component";
import { NativeRenderFullComponent } from "./nativeRender/nativeRenderFull.component";
import { NativeRenderComponent } from "./nativeRender/nativeRender.component";
import { NativeSectionComponent } from "./nativeRender/nativeSection.component";
import { NativeSectionMatrixComponent } from "./nativeRender/nativeSectionMatrix.component";
import { NativeQuestionComponent } from "./nativeRender/nativeQuestion.component";
import { NativeTableComponent } from "./nativeRender/nativeTable.component";

import { FormService } from "./form.service";
import { SkipLogicService } from "./skipLogic.service";
import { FormGeneralDetailsComponent } from "./components/formGeneralDetails/formGeneralDetails.component";
import { DisplayProfileComponent } from "./components/displayProfile/displayProfile.component";
import { FormTermMappingComponent } from "./components/formTermMapping/formTermMapping.component";
import { CreateFormComponent } from "./components/createForm.component";
import { FormViewComponent } from "./components/formView.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        NouisliderModule,
        Select2Module,
        SortableModule.forRoot(),
        TreeModule,
        // internal
        AdminItemModule,
        BoardModule,
        SearchModule,
        WidgetModule,
    ],
    declarations: [
        ArrayListPipe,
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        CdeSortableComponent,
        CreateFormComponent,
        DisplayProfileComponent,
        FormViewComponent,
        FormDescriptionComponent,
        FormDescriptionQuestionComponent,
        FormDescriptionQuestionDetailComponent,
        FormDescriptionSectionComponent,
        FormGeneralDetailsComponent,
        FormSearchDirective,
        FormSummaryListComponent,
        FormSummaryListContentComponent,
        FormTermMappingComponent,
        MergeFormComponent,
        NativeRenderFullComponent,
        NativeRenderComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeQuestionComponent,
        NativeTableComponent,
        QuestionSearchDirective
    ],
    entryComponents: [
        CreateFormComponent,
        DisplayProfileComponent,
        FormViewComponent,
        FormDescriptionComponent,
        FormGeneralDetailsComponent,
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        FormDescriptionComponent,
        FormSummaryListComponent,
        FormSummaryListContentComponent,
        MergeFormComponent,
        NativeRenderFullComponent,
        NativeRenderComponent,
    ],
    exports: [],
    providers: [
        FormService,
        SkipLogicService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
