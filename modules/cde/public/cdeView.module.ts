import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TreeModule } from 'angular-tree-component/dist/angular-tree-component';
import 'angular-tree-component/dist/angular-tree-component.css';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { BoardModule } from 'board/public/board.module';
import { CdeModule } from 'cde/public/cde.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { ConceptsComponent } from 'cde/public/components/concepts.component';
import { DatasetsComponent } from 'cde/public/components/datasets/datasets.component';
import { DataElementViewComponent } from 'cde/public/components/dataElementView.component';
import { DerivationRulesComponent } from 'cde/public/components/derivationRules.component';
import { MoreLikeThisComponent } from 'cde/public/components/mlt/moreLikeThis.component';
import { PermissibleValueComponent } from 'cde/public/components/permissibleValue.component';
import { CdeClassificationComponent } from './components/cdeClassification/cdeClassification.component';
import { DeGeneralDetailsComponent } from 'cde/public/components/deGeneralDetails/deGeneralDetails.component';
import { ValidRulesComponent } from 'cde/public/components/validationRules/validRules.component';
import { DiscussModule } from 'discuss/discuss.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { WidgetModule } from 'widget/widget.module';
import { CompareModule } from 'compare/compare.module';
import { MatButtonModule, MatIconModule, MatMenuModule } from "@angular/material";


const appRoutes: Routes = [
    {path: '', component: DataElementViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        TreeModule,
        NgSelectModule,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
        BoardModule,
        CdeModule,
        CdeSearchModule,
        CompareModule,
        DiscussModule,
        FormSearchModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule
    ],
    declarations: [
        CdeClassificationComponent,
        ConceptsComponent,
        DataElementViewComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        DataElementViewComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        ValidRulesComponent,
    ],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeViewModule {
}
