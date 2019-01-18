import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import 'angular-tree-component/dist/angular-tree-component.css';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { BoardModule } from 'board/public/board.module';
import { DeCompletionComponent } from 'cde/public/components/completion/deCompletion.component';
import { CreateDataElementComponent } from 'cde/public/components/createDataElement.component';
import { CdeAccordionListComponent } from 'cde/public/components/listView/cdeAccordionList.component';
import { CdeGeneralDetailsComponent } from 'cde/public/components/summary/cdeGeneralDetails.component';
import { ValueDomainSummaryComponent } from 'cde/public/components/summary/valueDomainSummary.component';
import { DiscussModule } from 'discuss/discuss.module';
import { SearchModule } from 'search/search.module';

import { MatButtonModule, MatDialogModule, MatIconModule } from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        NgSelectModule,
        RouterModule,
        TreeModule.forRoot(),
        // core

        // internal
        AdminItemModule,
        BoardModule,
        DiscussModule,
        SearchModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
    ],
    declarations: [
        CdeAccordionListComponent,
        CdeGeneralDetailsComponent,
        CreateDataElementComponent,
        DeCompletionComponent,
        ValueDomainSummaryComponent,
    ],
    entryComponents: [
        CdeAccordionListComponent,
    ],
    exports: [
        CdeGeneralDetailsComponent,
        CreateDataElementComponent,
        DeCompletionComponent,
        ValueDomainSummaryComponent,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeModule {
}
