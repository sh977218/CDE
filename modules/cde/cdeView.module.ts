import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { TocModule } from 'angular-aio-toc/toc.module';
import { BoardModule } from 'board/board.module';
import { CdeModule } from 'cde/cde.module';
import { CdeSearchModule } from 'cde/cdeSearch.module';
import { ConceptsComponent } from 'cde/concepts/concepts.component';
import { DataElementViewService } from 'cde/dataElementView/dataElementView.service';
import { DatasetsComponent } from 'cde/datasets/datasets.component';
import { DataElementViewComponent } from 'cde/dataElementView/dataElementView.component';
import { DerivationRulesComponent } from 'cde/derivationRules/derivationRules.component';
import { MoreLikeThisComponent } from 'cde/mlt/moreLikeThis.component';
import { CdeClassificationComponent } from 'cde/cdeClassification/cdeClassification.component';
import { DeGeneralDetailsComponent } from 'cde/deGeneralDetails/deGeneralDetails.component';
import { PermissibleValueComponent } from 'cde/permissibleValue/permissibleValue.component';
import { ValidRulesComponent } from 'cde/validationRules/validRules.component';
import { CompareModule } from 'compare/compare.module';
import { DiscussModule } from 'discuss/discuss.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { FormSearchModule } from 'form/formSearch.module';
import { NonCoreModule } from 'non-core/noncore.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';
import { WINDOW_PROVIDERS } from 'window.service';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { PinToBoardModule } from 'board/pin-to-board.module';

const appRoutes: Routes = [
    {path: '', component: DataElementViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSidenavModule,
        MatToolbarModule,
        MatTooltipModule,
        NgbModule,
        ScrollingModule,
        RouterModule.forChild(appRoutes),
        // non-core
        NonCoreModule,
        // internal
        InlineAreaEditModule,
        InlineEditModule,
        InlineSelectEditModule,
        SortableArrayModule,
        AdminItemModule,
        BoardModule,
        PinToBoardModule,
        CdeModule,
        CdeSearchModule,
        CompareModule,
        DiscussModule,
        FormSearchModule,
        TocModule,
        TourMatMenuModule
    ],
    declarations: [
        CdeClassificationComponent,
        ConceptsComponent,
        DataElementViewComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        ValidRulesComponent,
    ],
    exports: [
    ],
    providers: [
        DataElementViewService,
        WINDOW_PROVIDERS
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeViewModule {
}
