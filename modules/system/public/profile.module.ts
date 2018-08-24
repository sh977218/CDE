import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { ProfileComponent } from "./components/profile.component";
import { SearchModule } from 'search/search.module';
import { UserCommentsComponent } from "./components/userComments.component";
import { WidgetModule } from 'widget/widget.module';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BoardModule } from 'board/public/board.module';
import { DraftsListMyComponent } from "./components/draftsList/draftsListMy.component";
import { MatButtonModule, MatIconModule } from '@angular/material';

const appRoutes: Routes = [
    {path: '', component: ProfileComponent},
];

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
        CdeSearchModule,
        FormSearchModule,
        SearchModule,
        BoardModule,
        MatIconModule,
        MatButtonModule,
    ],
    declarations: [
        ProfileComponent,
        UserCommentsComponent,
        DraftsListMyComponent,
    ],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileModule {
}
