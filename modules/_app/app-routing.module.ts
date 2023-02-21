import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassifyGuard } from '_app/routerGuard/classifyGuard';
import { OfflineComponent } from '_app/routing/offline.component';
import { PageNotFoundComponent } from '_app/routing/pageNotFound.component';
import { IEGuard } from '_app/routerGuard/ieGuard';
import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';
import { NlmCuratorGuard } from '_app/routerGuard/nlmCuratorGuard';
import { OrgAdminGuard } from '_app/routerGuard/orgAdminGuard';
import { OrgAuthorityGuard } from '_app/routerGuard/orgAuthorityGuard';
import { OrgCuratorGuard } from '_app/routerGuard/orgCuratorGuard';
import { SiteAdminGuard } from '_app/routerGuard/siteAdminGuard';
import { FormResolve } from 'form/formDescription/form.resolve';
import { LoginFederatedComponent } from '_app/loginFederated.component';
import { ArticleGuard } from '_app/routerGuard/articleGuard';

const appRoutes: Routes = [
    {
        path: 'loginFederated',
        component: LoginFederatedComponent,
    },
    {
        path: 'api',
        loadChildren: () => import('system/public/documentApi.module').then(m => m.DocumentApiModule),
        data: { title: 'API Documentation', preload: false },
    },
    {
        path: 'about',
        loadChildren: () => import('system/public/about.module').then(m => m.AboutModule),
        data: { title: 'About', preload: false },
    },
    {
        path: 'board/:boardId',
        loadChildren: () => import('board/boardView.module').then(m => m.BoardViewModule),
        data: { title: 'Board View', preload: false },
    },
    {
        path: 'home',
        loadChildren: () => import('home/home.module').then(m => m.HomeModule),
        data: { preload: false },
    },
    {
        path: 'cde/search',
        loadChildren: () => import('cde/cdeSearchEntry.module').then(m => m.CdeSearchEntryModule),
        data: { title: 'Data Element Search', preload: false },
    },
    {
        path: 'cdeStatusReport',
        loadChildren: () => import('cde/cdeStatusReport.module').then(m => m.CdeStatusReportModule),
        data: { title: 'Data Element Status Report', preload: false },
    },
    { path: 'cde', redirectTo: '/cde/search', pathMatch: 'full' },
    {
        path: 'classificationManagement',
        loadChildren: () =>
            import('classificationManagement/classificationManagement.module').then(
                m => m.ClassificationManagementModule
            ),
        canLoad: [ClassifyGuard],
        data: { title: 'Manage Classification', preload: false },
    },
    {
        path: 'createCde',
        loadChildren: () => import('cde/cdeCreate.module').then(m => m.CdeCreateModule),
        data: { title: 'Create Data Element', preload: false },
    },
    {
        path: 'createForm',
        loadChildren: () => import('form/formCreate.module').then(m => m.FormCreateModule),
        data: { title: 'Create Form', preload: false },
    },
    {
        path: 'deView',
        loadChildren: () => import('cde/cdeView.module').then(m => m.CdeViewModule),
        data: { title: 'Data Element View', preload: false },
    },
    {
        path: 'form/search',
        loadChildren: () => import('form/formSearchEntry.module').then(m => m.FormSearchEntryModule),
        data: { title: 'Form Search', preload: false },
    },
    {
        path: 'formEdit',
        loadChildren: () => import('form/formEdit.module').then(m => m.FormEditModule),
        resolve: {
            form: FormResolve,
        },
        canLoad: [LoggedInGuard],
        data: { title: 'Form Edit' },
    },
    {
        path: 'formView',
        loadChildren: () => import('form/formView.module').then(m => m.FormViewModule),
        data: { title: 'Form View', preload: false },
    },
    { path: 'form', redirectTo: '/form/search', pathMatch: 'full' },
    {
        path: 'login',
        loadChildren: () => import('system/public/login.module').then(m => m.LoginModule),
        canLoad: [IEGuard],
        data: { title: 'Login', preload: false },
    },
    {
        path: 'ieDiscontinued',
        loadChildren: () => import('system/public/ieDiscontinued.module').then(m => m.IeDiscontinuedModule),
        data: { title: 'Upgrade Browser', preload: false },
    },
    {
        path: 'myBoards',
        loadChildren: () => import('board/myBoards.module').then(m => m.MyBoardsModule),
        data: { title: 'My Boards', preload: false },
    },
    {
        path: 'offline',
        component: OfflineComponent,
        data: { title: 'Offline', preload: false },
    },
    {
        path: 'resources',
        loadChildren: () => import('system/public/resources.module').then(m => m.ResourcesModule),
        data: { title: 'Resources', preload: false },
    },
    {
        path: 'settings',
        loadChildren: () => import('settings/settings.module').then(m => m.SettingsModule),
        canLoad: [LoggedInGuard],
        data: { title: 'Settings', preload: false },
    },
    {
        path: 'whatsNew',
        loadChildren: () => import('system/public/article.module').then(m => m.ArticleModule),
        data: { title: `What's New`, article: 'whatsNew', preload: false },
    },
    {
        path: 'nihDataSharing',
        loadChildren: () => import('system/public/article.module').then(m => m.ArticleModule),
        data: { title: `NIH Data Sharing`, article: 'nihDataSharing', preload: false },
    },
    {
        path: 'guides',
        loadChildren: () => import('system/public/guide.module').then(m => m.GuideModule),
        data: { title: 'Guides', preload: false },
    },
    {
        path: 'videos',
        loadChildren: () => import('system/public/videos.module').then(m => m.VideosModule),
        data: { title: 'Videos', preload: false },
    },
    {
        path: 'searchPreferences',
        loadChildren: () => import('system/public/searchPreferences.module').then(m => m.SearchPreferencesModule),
        canLoad: [LoggedInGuard],
        data: { title: 'Search Preferences', preload: false },
    },
    {
        path: 'siteAudit',
        loadChildren: () => import('siteAudit/siteAudit.module').then(m => m.SiteAuditModule),
        canLoad: [OrgAuthorityGuard],
        data: { title: 'Audit', preload: false },
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
        path: '**',
        component: PageNotFoundComponent,
        data: { title: 'Page Not Found', preload: false },
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
            enableTracing: false, // TODO: dev only
        }),
    ],
    declarations: [OfflineComponent, PageNotFoundComponent],
    providers: [
        ClassifyGuard,
        IEGuard,
        LoggedInGuard,
        NlmCuratorGuard,
        OrgAdminGuard,
        OrgAuthorityGuard,
        OrgCuratorGuard,
        SiteAdminGuard,
        ArticleGuard,
    ],
    exports: [RouterModule],
})
export class CdeAppRoutingModule {}
