import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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

import { TreeModule } from '@circlon/angular-tree-component';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { HotkeyModule } from 'angular2-hotkeys';
import { BoardModule } from 'board/board.module';
import { CdeModule } from 'cde/cde.module';
import { CdeSearchModule } from 'cde/cdeSearch.module';
import { CompareModule } from 'compare/compare.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
import { DiscussModule } from 'discuss/discuss.module';
import { ArrayListPipe } from 'form/arrayList.pipe';
import { FormViewComponent } from 'form/formView/formView.component';
import { FormViewService } from 'form/formView/formView.service';
import { FormSearchModule } from 'form/formSearch.module';
import { SkipLogicValidateService } from 'form/skipLogicValidate.service';
import { UcumService } from 'form/ucum.service';
import { DisplayProfileComponent } from 'form/displayProfile/displayProfile.component';
import { FormClassificationComponent } from 'form/formClassification/formClassification.component';
import { FormGeneralDetailsComponent } from 'form/formGeneralDetails/formGeneralDetails.component';
import { NativeRenderFullComponent } from 'form/nativeRenderFull/nativeRenderFull.component';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { NonCoreModule } from 'non-core/noncore.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';
import { SkipLogicModule } from 'skipLogic/skipLogic.module';
import { TagModule } from 'tag/tag.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuestionAccordionListComponent } from 'cde/listView/questionAccordingList/questionAccordingList.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WINDOW_PROVIDERS } from 'window.service';
import { TocModule } from 'angular-aio-toc/toc.module';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { PinToBoardModule } from 'board/pin-to-board.module';
import { FormCdesModalComponent } from 'form/formView/form-cdes-modal/form-cdes-modal.component';

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

        RouterModule.forChild(appRoutes),
        TreeModule,
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
        PinToBoardModule,
        CdeModule,
        CdeSearchModule,
        CompareModule,
        DiscussModule,
        FormSearchModule,
        NativeRenderModule,
        SkipLogicModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        MatListModule,
        MatToolbarModule,
        TocModule,
        TourMatMenuModule,
    ],
    declarations: [
        ArrayListPipe,
        DisplayProfileComponent,
        FormViewComponent,
        FormCdesModalComponent,
        FormClassificationComponent,
        FormGeneralDetailsComponent,
        NativeRenderFullComponent,
        QuestionAccordionListComponent,
    ],
    exports: [],
    providers: [
        FormViewService,
        WINDOW_PROVIDERS,
        SkipLogicValidateService,
        UcumService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class FormViewModule {
}
