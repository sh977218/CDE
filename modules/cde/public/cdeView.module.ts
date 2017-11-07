import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { BoardModule } from "board/public/board.module";
import { CdeClassificationComponent } from "./components/cdeClassification/cdeClassification.component";
import { CdeModule } from 'cde/public/cde.module';
import { ConceptsComponent } from "./components/concepts.component";
import { DatasetsComponent } from "./components/datasets/datasets.component";
import { DataElementService } from "./dataElement.service";
import { DataElementViewComponent } from "./components/dataElementView.component";
import { DerivationRulesComponent } from "./components/derivationRules.component";
import { DeGeneralDetailsComponent } from "./components/deGeneralDetails/deGeneralDetails.component";
import { DiscussModule } from 'discuss/discuss.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { MoreLikeThisComponent } from "./components/mlt/moreLikeThis.component";
import { PermissibleValueComponent } from "./components/permissibleValue.component";
import { ValidRulesComponent } from "./components/validationRules/validRules.component";
import { WidgetModule } from "widget/widget.module";


const appRoutes: Routes = [
    {path: '', component: DataElementViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        Select2Module,
        TreeModule,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
        BoardModule,
        CdeModule,
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
        DataElementViewComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        ValidRulesComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
        DataElementService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeViewModule {
}
