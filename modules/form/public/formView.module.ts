import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { ArrayListPipe } from "./arrayList.pipe";
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { DiscussModule } from "discuss/discuss.module";
import { DisplayProfileComponent } from "./components/displayProfile/displayProfile.component";
import { FormClassificationComponent } from "./components/formClassification/formClassification.component";
import { FormDescriptionComponent } from "./tabs/description/formDescription.component";
import { FormDescriptionQuestionComponent } from "./tabs/description/formDescriptionQuestion.component";
import { FormDescriptionQuestionDetailComponent } from "./tabs/description/formDescriptionQuestionDetail.component";
import { FormDescriptionSectionComponent } from "./tabs/description/formDescriptionSection.component";
import { FormGeneralDetailsComponent } from "./components/formGeneralDetails/formGeneralDetails.component";
import { FormSearchModule } from 'form/public/formSearch.module';
import { FormTermMappingComponent } from "./components/formTermMapping/formTermMapping.component";
import { FormViewComponent } from "./components/formView.component";
import { NativeRenderFullComponent } from 'form/public/tabs/general/nativeRenderFull.component';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { WidgetModule } from "widget/widget.module";
import { BoardModule } from 'board/public/board.module';

const appRoutes: Routes = [
    {path: '', component: FormViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        TreeModule,
        Select2Module,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
        BoardModule,
        CdeSearchModule,
        FormSearchModule,
        NativeRenderModule,
        DiscussModule,
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
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormViewModule {
}
