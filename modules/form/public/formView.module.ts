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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeModule } from '@circlon/angular-tree-component';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { HotkeyModule } from 'angular2-hotkeys';
import { BoardModule } from 'board/public/board.module';
import { CdeModule } from 'cde/public/cde.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { CompareModule } from 'compare/compare.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
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
import { NativeRenderFullComponent } from 'form/public/components/nativeRenderFull/nativeRenderFull.component';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { NonCoreModule } from 'non-core/noncore.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';
import { SkipLogicModule } from 'skipLogic/skipLogic.module';
import { TagModule } from 'tag/tag.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuestionAccordionListComponent } from 'cde/public/components/listView/questionAccordingList/questionAccordingList.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WINDOW_PROVIDERS } from 'window.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TocModule } from 'angular-aio-toc/toc.module';

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
        TooltipModule,
        TocModule,
    ],
    declarations: [
        ArrayListPipe,
        DisplayProfileComponent,
        FormViewComponent,
        FormClassificationComponent,
        FormGeneralDetailsComponent,
        FormTermMappingComponent,
        FhirProcedureMappingComponent,
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
