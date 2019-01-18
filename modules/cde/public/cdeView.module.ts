import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatDialogModule,
    MatIconModule, MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule, MatSelectModule, MatTooltipModule
} from "@angular/material";
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { TreeModule } from 'angular-tree-component';
import 'angular-tree-component/dist/angular-tree-component.css';
import { BoardModule } from 'board/public/board.module';
import { CdeModule } from 'cde/public/cde.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { ConceptsComponent } from 'cde/public/components/concepts.component';
import { DataElementViewService } from 'cde/public/components/dataElementView.service';
import { DatasetsComponent } from 'cde/public/components/datasets/datasets.component';
import { DataElementViewComponent } from 'cde/public/components/dataElementView.component';
import { DerivationRulesComponent } from 'cde/public/components/derivationRules.component';
import { MoreLikeThisComponent } from 'cde/public/components/mlt/moreLikeThis.component';
import { PermissibleValueComponent } from 'cde/public/components/permissibleValue.component';
import { CdeClassificationComponent } from 'cde/public/components/cdeClassification/cdeClassification.component';
import { DeGeneralDetailsComponent } from 'cde/public/components/deGeneralDetails/deGeneralDetails.component';
import { ValidRulesComponent } from 'cde/public/components/validationRules/validRules.component';
import { CompareModule } from 'compare/compare.module';
import { DiscussModule } from 'discuss/discuss.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { CoreModule } from 'core/core.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { SortableArrayModule } from 'sortableArray/sortableArray.module';


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
        NgSelectModule,
        // core
        CoreModule,

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
