import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {
    MatAutocompleteModule, MatBadgeModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule,
    MatDialogModule, MatDividerModule, MatExpansionModule, MatGridListModule, MatIconModule, MatInputModule,
    MatListModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSidenavModule,
    MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatTabsModule, MatTooltipModule,
} from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsComponent } from 'settings/settings.component';
import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';
import { ProfileComponent } from 'settings/profile/profile.component';
import { DraftsListModule } from 'draftsList/draftsList.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { BoardModule } from 'board/public/board.module';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { SearchModule } from 'search/search.module';
import { UserDataService } from 'system/public/components/profile/userData.service';
import { DataService } from 'shared/models.model';
import { NonCoreModule } from 'non-core/noncore.module';
import { SettingsResolve } from 'settings/settings.resolve';
import { OrgAdminComponent } from 'settings/orgAdmin/orgAdmin.component';
import { OrgCuratorComponent } from 'settings/orgCurator/orgCurator.component';
import { OrgAuthorityGuard } from '_app/routerGuard/orgAuthorityGuard';
import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';
import { StewardOrgTransferComponent } from 'settings/stewardOrgTransfer/stewardOrgTransfer.component';
import { EmbedComponent } from 'settings/embed/embed.component';
import { EditSiteAdminsComponent } from 'settings/editSiteAdmins/editSiteAdmins.component';
import { SiteAdminGuard } from '_app/routerGuard/siteAdminGuard';
import { UsersMgtComponent } from 'settings/usersMgt/usersMgt.component';
import { LatestCommentsComponent } from 'settings/latestComments/latestComments.component';
import { ServerStatusComponent } from 'settings/serverStatus/serverStatus.component';
import { ArticleAdminComponent } from 'settings/article/articleAdmin.component';
import { ResourcesAdminComponent } from 'settings/resources/resourcesAdmin.component';
import { FhirAppsComponent } from 'settings/fhirApps/fhirApps.component';
import { IdSourcesComponent } from 'settings/idSources/idSources.component';
import { MyDraftsComponent } from 'settings/myDrafts/myDrafts.component';
import { MyCommentsComponent } from 'settings/myComments/myComments.component';
import { ViewHistoryComponent } from 'settings/viewHistory/viewHistory.component';
import { MyOrgDraftsComponent } from 'settings/myOrgDrafts/myOrgDrafts.component';
import { AllDraftsComponent } from 'settings/allDrafts/allDrafts.component';
import { MyOrgCommentsComponent } from 'settings/myOrgComments/myOrgComments.component';
import { AllCommentsComponent } from 'settings/allComments/allComments.component';
import { StatusValidationRulesComponent } from 'settings/statusValidationRules/statusValidationRules.component';
import { OrgsEditComponent } from 'settings/orgsEdit/orgsEdit.component';
import { ListManagementComponent } from 'settings/listManagement/listManagement.component';
import { OneListMgtComponent } from 'settings/listManagement/oneListMgt.component';
import { MyPublishedFormsComponent } from 'settings/myPublishedForms/myPublishedForms.component';

const appRoutes: Routes = [
    {
        path: '', component: SettingsComponent,
        resolve: {user: SettingsResolve},
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
                path: 'viewHistory',
                component: ViewHistoryComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'View History'}
            },
            {
                path: 'publishedForms',
                component: MyPublishedFormsComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'My Published Forms'}
            },
            {
                path: 'myDrafts',
                component: MyDraftsComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'My Drafts'}
            },
            {
                path: 'myComments',
                component: MyCommentsComponent,
                canLoad: [LoggedInGuard],
                data: {title: 'My Comments'}
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
                component: MyOrgDraftsComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: "My Organizations' Drafts"}
            },
            {
                path: 'myOrgComments',
                component: MyOrgCommentsComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: "My Organizations' Comments"}
            },
            {
                path: 'embedding',
                component: EmbedComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'Embedding'}
            },

            {
                path: 'statusValidationRules',
                component: StatusValidationRulesComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'Status Validation Rules'}
            },
            {
                path: 'listManagement',
                component: ListManagementComponent,
                canLoad: [OrgAuthorityGuard],
                data: {title: 'List Management'}
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
                component: AllCommentsComponent,
                canLoad: [SiteAdminGuard],
                data: {title: 'All Comments'}
            },
            {
                path: 'allDrafts',
                component: AllDraftsComponent,
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
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatInputModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTabsModule,
        MatTooltipModule,

        NonCoreModule,
        DraftsListModule,
        InlineEditModule,
        BoardModule,
        CdeSearchModule,
        FormSearchModule,
        SearchModule,
        UsernameAutocompleteModule,
    ],
    declarations: [
        SettingsComponent,

        ProfileComponent,
        ViewHistoryComponent,
        MyPublishedFormsComponent,
        MyDraftsComponent,
        MyCommentsComponent,

        MyOrgDraftsComponent,
        MyOrgCommentsComponent,

        OneListMgtComponent,
        ListManagementComponent,
        OrgsEditComponent,
        OrgAdminComponent,
        OrgCuratorComponent,
        StewardOrgTransferComponent,
        EmbedComponent,
        StatusValidationRulesComponent,

        AllDraftsComponent,
        AllCommentsComponent,
        EditSiteAdminsComponent,
        UsersMgtComponent,
        LatestCommentsComponent,
        ServerStatusComponent,
        ArticleAdminComponent,
        ResourcesAdminComponent,
        FhirAppsComponent,
        IdSourcesComponent
    ],
    entryComponents: [],
    exports: [],
    providers: [
        SettingsResolve,
        {provide: DataService, useClass: UserDataService},
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsModule {
}