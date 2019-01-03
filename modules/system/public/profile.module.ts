import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
    MatButtonModule, MatIconModule, MatPaginatorModule, MatSelectModule, MatSlideToggleModule, MatTooltipModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BoardModule } from 'board/public/board.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { SearchModule } from 'search/search.module';
import { DraftsListMyComponent } from 'system/public/components/draftsList/draftsListMy.component';
import { ProfileComponent } from 'system/public/components/profile.component';
import { UserCommentsComponent } from 'system/public/components/userComments.component';
import { WidgetModule } from 'widget/widget.module';

const appRoutes: Routes = [
    {path: '', component: ProfileComponent},
];

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
        BoardModule,
        CdeSearchModule,
        FormSearchModule,
        SearchModule,
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
