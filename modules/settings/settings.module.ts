import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';
import { OrgAdminGuard } from '_app/routerGuard/orgAdminGuard';
import { OrgAuthorityGuard } from '_app/routerGuard/orgAuthorityGuard';
import { SiteAdminGuard } from '_app/routerGuard/siteAdminGuard';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { BoardModule } from 'board/public/board.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { NonCoreModule } from 'non-core/noncore.module';
import { SearchModule } from 'search/search.module';
import { ArticleAdminComponent } from 'settings/article/articleAdmin.component';
import { ArticleHelpDialogComponent } from 'settings/article/articleHelpDialog.component';
import { CommentsComponent } from 'settings/comments/comments.component';
import { AllDraftsResolve } from 'settings/drafts/allDrafts.resolve';
import { DataValidationComponent } from 'settings/dataValidation/dataValidation.component';
import { SpellCheckComponent } from 'settings/spellcheck/spellcheck.component';
import { DraftsComponent } from 'settings/drafts/drafts.component';
import { DraftsService } from 'settings/drafts/drafts.service';
import { MyDraftsResolve } from 'settings/drafts/myDrafts.resolve';
import { MyOrgDraftsResolve } from 'settings/drafts/myOrgDrafts.resolve';
import { EditSiteAdminsComponent } from 'settings/editSiteAdmins/editSiteAdmins.component';
import { IdSourcesComponent } from 'settings/idSources/idSources.component';
import { OneListMgtComponent } from 'settings/listManagement/oneListMgt.component';
import { ManagedOrgsResolve } from 'settings/managedOrgsResolve';
import { NotificationComponent } from 'settings/notification/notification.component';
import { OrgAdminComponent } from 'settings/orgAdmin/orgAdmin.component';
import { OrgCuratorComponent } from 'settings/orgCurator/orgCurator.component';
import { OrgEditorComponent } from 'settings/orgEditor/orgEditor.component';
import { OrgsEditComponent } from 'settings/orgsEdit/orgsEdit.component';
import { ProfileComponent } from 'settings/profile/profile.component';
import { PropertiesManagementComponent } from 'settings/propertiesManagement/propertiesManagement.component';
import { SearchSettingsComponent } from 'settings/search/searchSettings.component';
import { ServerStatusComponent } from 'settings/serverStatus/serverStatus.component';
import { SettingsComponent } from 'settings/settings.component';
import { StewardOrgTransferComponent } from 'settings/stewardOrgTransfer/stewardOrgTransfer.component';
import { TagsManagementComponent } from 'settings/tagsManagement/tagsManagement.component';
import { UsersMgtComponent } from 'settings/usersMgt/usersMgt.component';
import { ViewingHistoryComponent } from 'settings/viewingHistory/viewingHistory.component';
import { TagModule } from 'tag/tag.module';
import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';

const appRoutes: Routes = [
    {
        path: '', component: SettingsComponent,
        canActivate: [LoggedInGuard],
        children: [
            // All User Can Access
            {
                path: 'profile',
                component: ProfileComponent,
                canActivate: [LoggedInGuard],
                data: {title: 'Profile'}
            },
            {
                path: 'search',
                component: SearchSettingsComponent,
                canActivate: [LoggedInGuard],
                data: {title: 'Search Settings'},
            },
            {
                path: 'notification',
                component: NotificationComponent,
                canActivate: [LoggedInGuard],
                data: {title: 'Notification'}
            },
            {
                path: 'viewingHistory',
                component: ViewingHistoryComponent,
                canActivate: [LoggedInGuard],
                data: {title: 'Viewing History'}
            },
            {
                path: 'myDrafts',
                component: DraftsComponent,
                resolve: {drafts: MyDraftsResolve},
                canActivate: [LoggedInGuard],
                data: {title: 'My Drafts'}
            },
            {
                path: 'myComments',
                component: CommentsComponent,
                canActivate: [LoggedInGuard],
                data: {title: 'My Comments', commentsUrl: '/server/discuss/myComments/'}
            },
            // Org Authority Can Access
            {
                path: 'orgAdmin',
                component: OrgAdminComponent,
                canActivate: [OrgAdminGuard],
                data: {title: 'Org Admin'}
            },
            {
                path: 'orgCurator',
                component: OrgCuratorComponent,
                canActivate: [OrgAdminGuard],
                data: {title: 'Org Curator'}
            },
            {
                path: 'orgEditor',
                component: OrgEditorComponent,
                canActivate: [OrgAdminGuard],
                data: {title: 'Org Editor'}
            },
            {
                path: 'stewardOrgTransfer',
                component: StewardOrgTransferComponent,
                canActivate: [OrgAdminGuard],
                data: {title: 'Steward Org Transfer'}
            },
            {
                path: 'myOrgDrafts',
                component: DraftsComponent,
                resolve: {drafts: MyOrgDraftsResolve},
                canActivate: [LoggedInGuard],
                data: {title: 'My Organizations\' Drafts'}
            },
            {
                path: 'myOrgComments',
                component: CommentsComponent,
                canActivate: [LoggedInGuard],
                data: {title: 'My Organizations\' Comments', commentsUrl: '/server/discuss/orgComments/'}
            },
            {
                path: 'tagsManagement',
                component: TagsManagementComponent,
                canActivate: [OrgAuthorityGuard],
                resolve: {managedOrgs: ManagedOrgsResolve},
                data: {title: 'Tags Management'}
            },
            {
                path: 'propertiesManagement',
                component: PropertiesManagementComponent,
                canActivate: [OrgAuthorityGuard],
                resolve: {managedOrgs: ManagedOrgsResolve},
                data: {title: 'Properties Management'}
            },
            {
                path: 'orgsEdit',
                component: OrgsEditComponent,
                canActivate: [OrgAuthorityGuard],
                data: {title: 'Organizations'}
            },


            // Site Admin Can Access
            {
                path: 'siteAdmins',
                component: EditSiteAdminsComponent,
                canActivate: [SiteAdminGuard],
                data: {title: 'Site Admins'}
            },
            {
                path: 'users',
                component: UsersMgtComponent,
                canActivate: [OrgAdminGuard],
                data: {title: 'Users'}
            },
            {
                path: 'allComments',
                component: CommentsComponent,
                canActivate: [OrgAuthorityGuard],
                data: {title: 'All Comments', commentsUrl: '/server/discuss/allComments/'}
            },
            {
                path: 'allDrafts',
                component: DraftsComponent,
                resolve: {drafts: AllDraftsResolve},
                canActivate: [OrgAuthorityGuard],
                data: {title: 'All Drafts'}
            },
            {
                path: 'serverStatus',
                component: ServerStatusComponent,
                canActivate: [SiteAdminGuard],
                data: {title: 'Server Status'}
            },
            {
                path: 'articles',
                component: ArticleAdminComponent,
                canActivate: [OrgAuthorityGuard],
                data: {title: 'Articles'}
            },
            {
                path: 'idSources',
                component: IdSourcesComponent,
                canActivate: [SiteAdminGuard],
                data: {title: 'Id Sources'}
            },
            {
                path: 'dataValidation',
                component: DataValidationComponent,
                canActivate: [OrgAuthorityGuard],
                data: {title: 'Data Validation'}
            },
            {
                path: 'spellCheck',
                component: SpellCheckComponent,
                canActivate: [OrgAuthorityGuard],
                data: {title: 'Spell Check'}
            },
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        // internal
        NonCoreModule,
        InlineEditModule,
        InlineAreaEditModule,
        InlineSelectEditModule,
        TagModule,
        AdminItemModule,
        BoardModule,
        CdeSearchModule,
        FormSearchModule,
        SearchModule,
        UsernameAutocompleteModule,
    ],
    declarations: [
        ArticleHelpDialogComponent,
        ArticleAdminComponent,
        CommentsComponent,
        DraftsComponent,
        EditSiteAdminsComponent,
        IdSourcesComponent,
        DataValidationComponent,
        SpellCheckComponent,
        NotificationComponent,
        OneListMgtComponent,
        OrgsEditComponent,
        OrgAdminComponent,
        OrgCuratorComponent,
        OrgEditorComponent,
        ProfileComponent,
        PropertiesManagementComponent,
        SearchSettingsComponent,
        ServerStatusComponent,
        SettingsComponent,
        StewardOrgTransferComponent,
        TagsManagementComponent,
        UsersMgtComponent,
        ViewingHistoryComponent
    ],
    exports: [],
    providers: [
        DraftsService,
        MyDraftsResolve,
        MyOrgDraftsResolve,
        AllDraftsResolve,
        ManagedOrgsResolve
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsModule {
}
