import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { TreeModule } from 'angular-tree-component';
import 'angular-tree-component/dist/angular-tree-component.css';
import { BoardModule } from 'board/public/board.module';
import { CdeModule } from 'cde/public/cde.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { ConceptsComponent } from 'cde/public/components/concepts.component';
import { DataElementViewService } from 'cde/public/components/dataElementView/dataElementView.service';
import { DatasetsComponent } from 'cde/public/components/datasets/datasets.component';
import { DataElementViewComponent } from 'cde/public/components/dataElementView/dataElementView.component';
import { DerivationRulesComponent } from 'cde/public/components/derivationRules.component';
import { MoreLikeThisComponent } from 'cde/public/components/mlt/moreLikeThis.component';
import { CdeClassificationComponent } from 'cde/public/components/cdeClassification/cdeClassification.component';
import { DeGeneralDetailsComponent } from 'cde/public/components/deGeneralDetails/deGeneralDetails.component';
import { PermissibleValueComponent } from 'cde/public/components/permissibleValue/permissibleValue.component';
import { ValidRulesComponent } from 'cde/public/components/validationRules/validRules.component';
import { CompareModule } from 'compare/compare.module';
import { DiscussModule } from 'discuss/discuss.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { NonCoreModule } from 'non-core/noncore.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const appRoutes: Routes = [
    {path: '', component: DataElementViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        TreeModule.forRoot(),
        // non-core
        NonCoreModule,

        // internal
        InlineAreaEditModule,
        InlineEditModule,
        InlineSelectEditModule,
        SortableArrayModule,
        AdminItemModule,
        BoardModule,
        CdeModule,
        CdeSearchModule,
        CompareModule,
        DiscussModule,
        FormSearchModule,
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
    entryComponents: [],
    exports: [],
    providers: [
        DataElementViewService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeViewModule {
}
