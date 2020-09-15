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
    {path: 'api', loadChildren: () => import('system/public/documentApi.module').then(m => m.DocumentApiModule), data: {title: 'API Documentation', preload: false}},
    {path: 'boardList', loadChildren: () => import('board/public/boardList.module').then(m => m.BoardListModule), data: {title: 'Public Boards', preload: false}},
    {path: 'board/:boardId', loadChildren: () => import('board/public/boardView.module').then(m => m.BoardViewModule), data: {title: 'Board View', preload: false}},
    {path: 'home', loadChildren: () => import('home/home.module').then(m => m.HomeModule), data: {preload: false}},
    {path: 'cde/search', loadChildren: () => import('cde/public/cdeSearchEntry.module').then(m => m.CdeSearchEntryModule), data: {title: 'Data Element Search', preload: false}},
    {
        path: 'cdeStatusReport', loadChildren: () => import('cde/public/cdeStatusReport.module').then(m => m.CdeStatusReportModule),
        data: {title: 'Data Element Status Report', preload: false}
    },
    {path: 'cde', redirectTo: '/cde/search', pathMatch: 'full'},
    {
        path: 'classificationManagement',
        loadChildren: () => import('classificationManagement/classificationManagement.module').then(m => m.ClassificationManagementModule),
        canLoad: [OrgCuratorGuard],
        data: {title: 'Manage Classification', preload: false},
    },
    {path: 'createCde', loadChildren: () => import('cde/public/cdeCreate.module').then(m => m.CdeCreateModule), data: {title: 'Create Data Element', preload: false}},
    {path: 'createForm', loadChildren: () => import('form/public/formCreate.module').then(m => m.FormCreateModule), data: {title: 'Create Form', preload: false}},
    {
        path: 'deView',
        loadChildren: () => import('cde/public/cdeView.module').then(m => m.CdeViewModule),
        data: {title: 'Data Element View', preload: false},
    },
    {path: 'form/search', loadChildren: () => import('form/public/formSearchEntry.module').then(m => m.FormSearchEntryModule), data: {title: 'Form Search', preload: false}},
    {
        path: 'formView',
        loadChildren: () => import('form/public/formView.module').then(m => m.FormViewModule),
        data: {title: 'Form View', preload: false},
    },
    {path: 'form', redirectTo: '/form/search', pathMatch: 'full'},
    {path: 'login', loadChildren: () => import('system/public/login.module').then(m => m.LoginModule), canLoad: [IEGuard], data: {title: 'Login', preload: false}},
    {
        path: 'ieDiscontinued',
        loadChildren: () => import('system/public/ieDiscontinued.module').then(m => m.IeDiscontinuedModule),
        data: {title: 'Upgrade Browser', preload: false},
    },
    {
        path: 'myBoards',
        loadChildren: () => import('board/public/myBoards.module').then(m => m.MyBoardsModule),
        data: {title: 'My Boards', preload: false},
    },
    {path: 'offline', component: OfflineComponent, data: {title: 'Offline', preload: false}},
    {path: 'quickBoard', loadChildren: () => import('quickBoard/quickBoard.module').then(m => m.QuickBoardModule), data: {title: 'Quick Board', preload: false}},
    {
        path: 'resources',
        loadChildren: () => import('system/public/resources.module').then(m => m.ResourcesModule),
        data: {title: 'Resources', preload: false},
    },
    {
        path: 'settings',
        loadChildren: () => import('settings/settings.module').then(m => m.SettingsModule),
        canLoad: [LoggedInGuard],
        data: {title: 'Settings', preload: false},
    },
    {
        path: 'whatsNew',
        loadChildren: () => import('system/public/article.module').then(m => m.ArticleModule),
        data: {title: `What's New`, article: 'whatsNew', preload: false},
    },
    {path: 'guides', loadChildren: () => import('system/public/article.module').then(m => m.ArticleModule), data: {title: 'Guides', article: 'guides', preload: false}},
    {path: 'contactUs', loadChildren: () => import('system/public/contactUs.module').then(m => m.ContactUsModule), data: {title: 'Contact Us', preload: false}},
    {
        path: 'videos',
        loadChildren: () => import('system/public/videos.module').then(m => m.VideosModule),
        data: {title: 'Videos', preload: false}
    },
    {
        path: 'searchPreferences',
        loadChildren: () => import('system/public/searchPreferences.module').then(m => m.SearchPreferencesModule),
        data: {title: 'Search Preferences', preload: false},
    },
    {
        path: 'siteAudit',
        loadChildren: () => import('siteAudit/siteAudit.module').then(m => m.SiteAuditModule),
        canLoad: [OrgAuthorityGuard],
        data: {title: 'Audit', preload: false},
    },
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: '**', component: PageNotFoundComponent, data: {title: 'Page Not Found', preload: false}}
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                enableTracing: false, // TODO: dev only
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
        SiteAdminGuard
    ],
    exports: [
        RouterModule
    ]
})
export class CdeAppRoutingModule {
}
