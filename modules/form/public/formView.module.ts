import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeModule } from 'angular-tree-component';
import { Select2Module } from 'ng2-select2';
import {HotkeyModule} from 'angular2-hotkeys';

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
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { WidgetModule } from 'widget/widget.module';

const appRoutes: Routes = [
    {path: '', component: FormViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        Select2Module,
        HotkeyModule.forRoot(),
        TreeModule,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
        BoardModule,
        CdeSearchModule,
        DiscussModule,
        FormSearchModule,
        NativeRenderModule,
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
    entryComponents: [],
    exports: [],
    providers: [
        SkipLogicValidateService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormViewModule {
}
