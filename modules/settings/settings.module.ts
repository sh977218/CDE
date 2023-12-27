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
import { MatLegacyChipsModule } from '@angular/material/legacy-chips';
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
import { AdminItemModule } from 'adminItem/adminItem.module';
import { BoardModule } from 'board/board.module';
import { CdeSearchModule } from 'cde/cdeSearch.module';
import { DeleteWithConfirmModule } from 'deleteWithConfirm/deleteWithConfirm.module';
import { FormSearchModule } from 'form/formSearch.module';
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
import { OrgAdminComponent } from 'settings/orgAdmin/orgAdmin.component';
import { OrgCuratorComponent } from 'settings/orgCurator/orgCurator.component';
import { OrgEditorComponent } from 'settings/orgEditor/orgEditor.component';
import { OrgsEditComponent } from 'settings/orgsEdit/orgsEdit.component';
import { ProfileComponent } from 'settings/profile/profile.component';
import { PropertiesManagementComponent } from 'settings/propertiesManagement/propertiesManagement.component';
import { SearchSettingsComponent } from 'settings/search/searchSettings.component';
import { ConfirmReindexModalComponent } from 'settings/serverStatus/confirm-reindex-modal/confirm-reindex-modal.component';
import { ServerStatusComponent } from 'settings/serverStatus/serverStatus.component';
import { SettingsComponent } from 'settings/settings.component';
import { EditWhiteListModalComponent } from 'settings/spellcheck/edit-white-list-modal/edit-white-list-modal.component';
import { DeleteWhiteListModalComponent } from 'settings/spellcheck/delete-white-list-modal/delete-white-list-modal.component';
import { AddWhiteListModalComponent } from 'settings/spellcheck/add-white-list-modal/add-white-list-modal.component';
import { StewardOrgTransferComponent } from 'settings/stewardOrgTransfer/stewardOrgTransfer.component';
import { SubmissionWorkbookValidationComponent } from 'settings/submissionWorkbookValidation/submissionWorkbookValidation.component';
import { TagsManagementComponent } from 'settings/tagsManagement/tagsManagement.component';
import { CreateUserModalComponent } from 'settings/usersMgt/create-user-modal/create-user-modal.component';
import { UsersMgtComponent } from 'settings/usersMgt/usersMgt.component';
import { ViewingHistoryComponent } from 'settings/viewingHistory/viewingHistory.component';
import { TagModule } from 'tag/tag.module';
import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';
import { SubmissionModule } from 'submission/submission.module';
import { articleGuard } from '_app/routerGuard/articleGuard';
import { siteAdminGuard } from '_app/routerGuard/siteAdminGuard';
import { orgAdminGuard } from '_app/routerGuard/orgAdminGuard';
import { orgAuthorityGuard } from '_app/routerGuard/orgAuthorityGuard';

const appRoutes: Routes = [
    {
        path: '',
        component: SettingsComponent,
        children: [
            // All User Can Access
            {
                path: 'profile',
                component: ProfileComponent,
                data: { title: 'Profile' },
            },
            {
                path: 'search',
                component: SearchSettingsComponent,
                data: { title: 'Search Settings' },
            },
            {
                path: 'viewingHistory',
                component: ViewingHistoryComponent,
                data: { title: 'Viewing History' },
            },
            {
                path: 'myDrafts',
                component: DraftsComponent,
                resolve: { drafts: MyDraftsResolve },
                data: { title: 'My Drafts' },
            },
            {
                path: 'myComments',
                component: CommentsComponent,
                data: {
                    title: 'My Comments',
                    commentsUrl: '/server/discuss/myComments/',
                },
            },
            // Org Authority Can Access
            {
                path: 'orgAdmin',
                component: OrgAdminComponent,
                canActivate: [orgAdminGuard],
                data: { title: 'Org Admin' },
            },
            {
                path: 'orgCurator',
                component: OrgCuratorComponent,
                canActivate: [orgAdminGuard],
                data: { title: 'Org Curator' },
            },
            {
                path: 'orgEditor',
                component: OrgEditorComponent,
                canActivate: [orgAdminGuard],
                data: { title: 'Org Editor' },
            },
            {
                path: 'stewardOrgTransfer',
                component: StewardOrgTransferComponent,
                canActivate: [orgAdminGuard],
                data: { title: 'Steward Org Transfer' },
            },
            {
                path: 'myOrgDrafts',
                component: DraftsComponent,
                resolve: { drafts: MyOrgDraftsResolve },
                data: { title: "My Organizations' Drafts" },
            },
            {
                path: 'myOrgComments',
                component: CommentsComponent,
                data: {
                    title: "My Organizations' Comments",
                    commentsUrl: '/server/discuss/orgComments/',
                },
            },
            {
                path: 'tagsManagement',
                component: TagsManagementComponent,
                canActivate: [orgAuthorityGuard],
                resolve: { managedOrgs: ManagedOrgsResolve },
                data: { title: 'Tags Management' },
            },
            {
                path: 'propertiesManagement',
                component: PropertiesManagementComponent,
                canActivate: [orgAuthorityGuard],
                resolve: { managedOrgs: ManagedOrgsResolve },
                data: { title: 'Properties Management' },
            },
            {
                path: 'orgsEdit',
                component: OrgsEditComponent,
                canActivate: [orgAuthorityGuard],
                data: { title: 'Organizations' },
            },

            // Site Admin Can Access
            {
                path: 'siteAdmins',
                component: EditSiteAdminsComponent,
                canActivate: [siteAdminGuard],
                data: { title: 'Site Admins' },
            },
            {
                path: 'users',
                component: UsersMgtComponent,
                canActivate: [orgAdminGuard],
                data: { title: 'Users' },
            },
            {
                path: 'allComments',
                component: CommentsComponent,
                canActivate: [orgAuthorityGuard],
                data: {
                    title: 'All Comments',
                    commentsUrl: '/server/discuss/allComments/',
                },
            },
            {
                path: 'allDrafts',
                component: DraftsComponent,
                resolve: { drafts: AllDraftsResolve },
                canActivate: [orgAuthorityGuard],
                data: { title: 'All Drafts' },
            },
            {
                path: 'serverStatus',
                component: ServerStatusComponent,
                canActivate: [siteAdminGuard],
                data: { title: 'Server Status' },
            },
            {
                path: 'articles',
                component: ArticleAdminComponent,
                canActivate: [articleGuard],
                data: { title: 'Articles' },
            },
            {
                path: 'idSources',
                component: IdSourcesComponent,
                canActivate: [siteAdminGuard],
                data: { title: 'Id Sources' },
            },
            {
                path: 'dataValidation',
                component: DataValidationComponent,
                canActivate: [orgAuthorityGuard],
                data: { title: 'Data Validation' },
            },
            {
                path: 'spellCheck',
                component: SpellCheckComponent,
                canActivate: [orgAuthorityGuard],
                data: { title: 'Spell Check' },
            },
            {
                path: 'submissionWorkbookValidation',
                component: SubmissionWorkbookValidationComponent,
                data: { title: 'Submission Workbook Validation' },
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

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
        MatLegacyChipsModule,
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
        DeleteWithConfirmModule,
        InlineEditModule,
        InlineAreaEditModule,
        InlineSelectEditModule,
        TagModule,
        AdminItemModule,
        BoardModule,
        CdeSearchModule,
        FormSearchModule,
        SearchModule,
        SubmissionModule,
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
        SubmissionWorkbookValidationComponent,
        EditWhiteListModalComponent,
        DeleteWhiteListModalComponent,
        AddWhiteListModalComponent,
        OneListMgtComponent,
        OrgsEditComponent,
        OrgAdminComponent,
        OrgCuratorComponent,
        OrgEditorComponent,
        ProfileComponent,
        PropertiesManagementComponent,
        SearchSettingsComponent,
        ServerStatusComponent,
        ConfirmReindexModalComponent,
        SettingsComponent,
        StewardOrgTransferComponent,
        TagsManagementComponent,
        UsersMgtComponent,
        CreateUserModalComponent,
        ViewingHistoryComponent,
    ],
    exports: [],
    providers: [DraftsService, MyDraftsResolve, MyOrgDraftsResolve, AllDraftsResolve, ManagedOrgsResolve],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsModule {}
