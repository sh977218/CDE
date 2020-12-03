import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';
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
import { CommentsComponent } from 'settings/comments/comments.component';
import { DraftsComponent } from 'settings/drafts/drafts.component';
import { AllDraftsResolve } from 'settings/drafts/allDrafts.resolve';
import { MyOrgDraftsResolve } from 'settings/drafts/myOrgDrafts.resolve';
import { MyDraftsResolve } from 'settings/drafts/myDrafts.resolve';
import { DraftsService } from 'settings/drafts/drafts.service';
import { EditSiteAdminsComponent } from 'settings/editSiteAdmins/editSiteAdmins.component';
import { FhirAppsComponent } from 'settings/fhirApps/fhirApps.component';
import { IdSourcesComponent } from 'settings/idSources/idSources.component';
import { OneListMgtComponent } from 'settings/listManagement/oneListMgt.component';
import { ManagedOrgsResolve } from 'settings/managedOrgsResolve';
import { MyPublishedFormsComponent } from 'settings/myPublishedForms/myPublishedForms.component';
import { NotificationComponent } from 'settings/notification/notification.component';
import { OrgsEditComponent } from 'settings/orgsEdit/orgsEdit.component';
import { OrgAdminComponent } from 'settings/orgAdmin/orgAdmin.component';
import { OrgCuratorComponent } from 'settings/orgCurator/orgCurator.component';
import { ProfileComponent } from 'settings/profile/profile.component';
import { PropertiesManagementComponent } from 'settings/propertiesManagement/propertiesManagement.component';
import { ResourcesAdminComponent } from 'settings/resources/resourcesAdmin.component';
import { ServerStatusComponent } from 'settings/serverStatus/serverStatus.component';
import { SettingsComponent } from 'settings/settings.component';
import { StatusValidationRulesComponent } from 'settings/statusValidationRules/statusValidationRules.component';
import { StewardOrgTransferComponent } from 'settings/stewardOrgTransfer/stewardOrgTransfer.component';
import { TagsManagementComponent } from 'settings/tagsManagement/tagsManagement.component';
import { UsersMgtComponent } from 'settings/usersMgt/usersMgt.component';
import { ViewingHistoryComponent } from 'settings/viewingHistory/viewingHistory.component';
import { TagModule } from 'tag/tag.module';
import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';
import { ResourcesHelpDialogComponent } from 'settings/resources/resourceHelpDialog.component';
import { ArticleHelpDialogComponent } from 'settings/article/articleHelpDialog.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTreeModule } from '@angular/material/tree';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSortModule } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

const appRoutes: Routes = [
    {
        path: '', component: SettingsComponent,
        canLoad: [LoggedInGuard],
        children: [
            // All User Can Access
            {
                path: 'profile',
                component: ProfileComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'Profile'}
            },
            {
                path: 'notification',
                component: NotificationComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'Notification'}
            },
            {
                path: 'viewingHistory',
                component: ViewingHistoryComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'Viewing History'}
            },
            {
                path: 'publishedForms',
                component: MyPublishedFormsComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'My Published Forms'}
            },
            {
                path: 'myDrafts',
                component: DraftsComponent,
                resolve: {drafts: MyDraftsResolve},
                canLoad: [LoggedInGuard],
                data: {title: 'My Drafts'}
            },
            {
                path: 'myComments',
                component: CommentsComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'My Comments', commentsUrl: '/server/discuss/myComments/'}
            },
            // Org Authority Can Access
            {
                path: 'orgAdmin',
                component: OrgAdminComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'Org Admin'}
            },
            {
                path: 'orgCurator',
                component: OrgCuratorComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'Org Curator'}
            },
            {
                path: 'stewardOrgTransfer',
                component: StewardOrgTransferComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'Steward Org Transfer'}
            },
            {
                path: 'myOrgDrafts',
                component: DraftsComponent,
                resolve: {drafts: MyOrgDraftsResolve},
                canLoad: [OrgAuthorityGuard],
                data: {title: 'My Organizations\' Drafts'}
            },
            {
                path: 'myOrgComments',
                component: CommentsComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'My Organizations\' Comments', commentsUrl: '/server/discuss/orgComments/'}
            },
            {
                path: 'statusValidationRules',
                component: StatusValidationRulesComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'Status Validation Rules'}
            },
            {
                path: 'tagsManagement',
                component: TagsManagementComponent,
                canLoad: [OrgAuthorityGuard],
                resolve: {managedOrgs: ManagedOrgsResolve},
                data: {title: 'Tags Management'}
            },
            {
                path: 'propertiesManagement',
                component: PropertiesManagementComponent,
                canLoad: [OrgAuthorityGuard],
                resolve: {managedOrgs: ManagedOrgsResolve},
                data: {title: 'Properties Management'}
            },
            {
                path: 'orgsEdit',
                component: OrgsEditComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'Organizations'}
            },


            // Site Admin Can Access
            {
                path: 'siteAdmins',
                component: EditSiteAdminsComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'Site Admins'}
            },
            {
                path: 'users',
                component: UsersMgtComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'Users'}
            },
            {
                path: 'allComments',
                component: CommentsComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'All Comments', commentsUrl: '/server/discuss/allComments/'}
            },
            {
                path: 'allDrafts',
                component: DraftsComponent,
                resolve: {drafts: AllDraftsResolve},
                canLoad: [SiteAdminGuard],
                data: {title: 'All Drafts'}
            },
            {
                path: 'serverStatus',
                component: ServerStatusComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'Server Status'}
            },
            {
                path: 'articles',
                component: ArticleAdminComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'Articles'}
            },
            {
                path: 'resources',
                component: ResourcesAdminComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'Resources'}
            },
            {
                path: 'fhirApps',
                component: FhirAppsComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'Fhir Apps'}
            },
            {
                path: 'idSources',
                component: IdSourcesComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'Id Sources'}
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
        FhirAppsComponent,
        IdSourcesComponent,
        MyPublishedFormsComponent,
        NotificationComponent,
        OneListMgtComponent,
        OrgsEditComponent,
        OrgAdminComponent,
        OrgCuratorComponent,
        ProfileComponent,
        PropertiesManagementComponent,
        ResourcesHelpDialogComponent,
        ResourcesAdminComponent,
        ServerStatusComponent,
        SettingsComponent,
        StatusValidationRulesComponent,
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
