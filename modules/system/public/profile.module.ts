import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import {
    MatButtonModule, MatIconModule, MatPaginatorModule, MatSelectModule, MatSlideToggleModule, MatTooltipModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BoardModule } from 'board/public/board.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { NonCoreModule } from 'non-core/noncore.module';
import { DraftsListModule } from 'draftsList/draftsList.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { SearchModule } from 'search/search.module';
import { DataService } from 'shared/models.model';
import { ProfileComponent } from 'system/public/components/profile.component';
import { UserDataService } from 'system/public/components/profile/userData.service';
import { UserCommentsComponent } from 'system/public/components/userComments.component';

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
        // non-core
        NonCoreModule,
        // internal
        DraftsListModule,
        InlineEditModule,
        BoardModule,
        CdeSearchModule,
        FormSearchModule,
        SearchModule,
    ],
    declarations: [
        ProfileComponent,
        UserCommentsComponent
    ],
    entryComponents: [],
    exports: [],
    providers: [
        {provide: DataService, useClass: UserDataService},
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileModule {
}
