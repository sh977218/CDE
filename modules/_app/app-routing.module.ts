import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfflineComponent } from '_app/routing/offline.component';
import { PageNotFoundComponent } from '_app/routing/pageNotFound.component';
import { IEGuard } from '_app/routerGuard/ieGuard';
import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';
import { OrgAdminGuard } from '_app/routerGuard/orgAdminGuard';
import { OrgAuthorityGuard } from '_app/routerGuard/orgAuthorityGuard';
import { OrgCuratorGuard } from '_app/routerGuard/orgCuratorGuard';
import { SiteAdminGuard } from '_app/routerGuard/siteAdminGuard';

const appRoutes: Routes = [
    {path: 'api', loadChildren: 'system/public/documentApi.module#DocumentApiModule', data: {title: 'API Documentation'}},
    {path: 'boardList', loadChildren: 'board/public/boardList.module#BoardListModule', data: {title: 'Public Boards'}},
    {path: 'board/:boardId', loadChildren: 'board/public/boardView.module#BoardViewModule', data: {title: 'Board View'}},
    {path: 'home', loadChildren: 'home/home.module#HomeModule'},
    {path: 'cde/search', loadChildren: 'cde/public/cdeSearchEntry.module#CdeSearchEntryModule', data: {title: 'Data Element Search'}},
    {
        path: 'cdeStatusReport', loadChildren: 'cde/public/cdeStatusReport.module#CdeStatusReportModule',
        data: {title: 'Data Element Status Report'}
        },
    {path: 'cde', redirectTo: '/cde/search', pathMatch: 'full'},
    {
        path: 'classificationManagement',
        loadChildren: 'classificationManagement/classificationManagement.module#ClassificationManagementModule',
        canLoad: [OrgCuratorGuard],
        data: {title: 'Manage Classification'},
    },
    {path: 'createCde', loadChildren: 'cde/public/cdeCreate.module#CdeCreateModule', data: {title: 'Create Data Element'}},
    {path: 'createForm', loadChildren: 'form/public/formCreate.module#FormCreateModule', data: {title: 'Create Form'}},
    {path: 'deView', loadChildren: 'cde/public/cdeView.module#CdeViewModule', data: {title: 'Data Element View'}},
    {path: 'form/search', loadChildren: 'form/public/formSearchEntry.module#FormSearchEntryModule', data: {title: 'Form Search'}},
    {path: 'formView', loadChildren: 'form/public/formView.module#FormViewModule', data: {title: 'Form View'}},
    {path: 'form', redirectTo: '/form/search', pathMatch: 'full'},
    {path: 'login', loadChildren: 'system/public/login.module#LoginModule', canLoad: [IEGuard], data: {title: 'Login'}},
    {path: 'ieDiscontinued', loadChildren: 'system/public/ieDiscontinued.module#IeDiscontinuedModule', data: {title: 'Upgrade Browser'}},
    {path: 'myBoards', loadChildren: 'board/public/myBoards.module#MyBoardsModule', data: {title: 'My Boards'}},
    {path: 'offline', component: OfflineComponent, data: {title: 'Offline'}},
    {path: 'quickBoard', loadChildren: 'quickBoard/quickBoard.module#QuickBoardModule', data: {title: 'Quick Board'}},
    {path: 'resources', loadChildren: 'system/public/resources.module#ResourcesModule', data: {title: 'Resources'}},
    {path: 'settings', loadChildren: 'settings/settings.module#SettingsModule', canLoad: [LoggedInGuard], data: {title: 'Settings'}},
    {path: 'whatsNew', loadChildren: 'system/public/whatsNew.module#WhatsNewModule', data: {title: `What's New`}},
    {path: 'contactUs', loadChildren: 'system/public/contactUs.module#ContactUsModule', data: {title: 'Contact Us'}},
    {path: 'videos', loadChildren: 'system/public/videos.module#VideosModule', data: {title: 'Videos'}},
    {
        path: 'searchPreferences',
        loadChildren: 'system/public/searchPreferences.module#SearchPreferencesModule',
        data: {title: 'Search Preferences'},
    },
    {path: 'siteAudit', loadChildren: 'siteAudit/siteAudit.module#SiteAuditModule', canLoad: [OrgAuthorityGuard], data: {title: 'Audit'}},
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: '**', component: PageNotFoundComponent, data: {title: 'Page Not Found'}}
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                // enableTracing: true, // TODO: dev only
            }
        ),
    ],
    declarations: [
        OfflineComponent,
        PageNotFoundComponent,
    ],
    providers: [
        IEGuard,
        LoggedInGuard,
        OrgAdminGuard,
        OrgAuthorityGuard,
        OrgCuratorGuard,
        SiteAdminGuard,
    ],
    exports: [RouterModule]
})
export class CdeAppRoutingModule {
}
