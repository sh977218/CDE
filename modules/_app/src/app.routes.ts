import { Routes } from '@angular/router';
import { LoginFederatedComponent } from '_app/loginFederated.component';
import { ManagedOrgsResolve } from 'settings/managedOrgsResolve';
import { classifyGuard } from '_app/routerGuard/classifyGuard';
import { loggedInGuard } from '_app/routerGuard/loggedInGuard';
import { FormResolve } from 'form/formDescription/form.resolve';
import { LoginResolve } from 'login/login.resolve';
import { OfflineComponent } from '_app/routing/offline.component';
import { ResourceResolve } from 'resources/resources.resolve';
import { VideosResolve } from 'videos/videos.resolve';
import { orgAuthorityGuard } from '_app/routerGuard/orgAuthorityGuard';
import { PageNotFoundComponent } from '_app/routing/pageNotFound.component';

export const app_routes: Routes = [
    {
        path: 'loginFederated',
        component: LoginFederatedComponent,
    },
    {
        path: 'api',
        loadComponent: () => import('swagger/swagger.component').then(c => c.SwaggerComponent),
        title: 'API Documentation',
        data: { preload: false },
    },
    {
        path: 'about',
        loadComponent: () => import('about/about.component').then(c => c.AboutComponent),
        title: 'About',
        data: { preload: false },
    },
    {
        path: 'board/:boardId',
        loadComponent: () => import('board/boardView/boardView.component').then(c => c.BoardViewComponent),
        title: 'Board View',
        data: { preload: false },
    },
    {
        path: 'home',
        loadChildren: () => import('home/home.module').then(m => m.HomeModule),
        data: { preload: false },
    },
    {
        path: 'cde/search',
        loadComponent: () => import('cde/search/cdeSearch.component').then(c => c.CdeSearchComponent),
        title: 'Data Element Search',
        data: { preload: false },
    },
    {
        path: 'cdeStatusReport',
        loadChildren: () => import('cde/cdeStatusReport.module').then(m => m.CdeStatusReportModule),
        title: 'Data Element Status Report',
        data: { preload: false },
    },
    { path: 'cde', redirectTo: '/cde/search', pathMatch: 'full' },
    {
        path: 'classificationManagement',
        loadComponent: () =>
            import('classificationManagement/orgClassificationManagement/orgClassificationManagement.component').then(
                c => c.OrgClassificationManagementComponent
            ),
        resolve: {
            orgs: ManagedOrgsResolve,
        },
        canActivate: [classifyGuard],
        title: 'Manage Org Classification',
        data: { preload: false },
    },
    {
        path: 'collection',
        loadChildren: () => import('submission/submission.module').then(m => m.SubmissionModule),
        title: 'Collections',
        data: { preload: false },
    },
    {
        path: 'createCde',
        loadComponent: () =>
            import('cde/createDataElement/createDataElement.component').then(c => c.CreateDataElementComponent),
        canActivate: [loggedInGuard],
        title: 'Create Data Element',
        data: { preload: false },
    },
    {
        path: 'createForm',
        loadComponent: () => import('form/createForm/createForm.component').then(c => c.CreateFormComponent),
        canActivate: [loggedInGuard],
        title: 'Create Form',
        data: { preload: false },
    },
    {
        path: 'deView',
        loadComponent: () =>
            import('cde/dataElementView/dataElementView.component').then(c => c.DataElementViewComponent),
        title: 'Data Element View',
        data: { preload: false },
    },
    {
        path: 'form/search',
        loadChildren: () => import('form/formSearchEntry.module').then(m => m.FormSearchEntryModule),
        title: 'Form Search',
        data: { preload: false },
    },
    {
        path: 'formEdit',
        loadChildren: () => import('form/formEdit.module').then(m => m.FormEditModule),
        resolve: {
            form: FormResolve,
        },
        canActivate: [loggedInGuard],
        title: 'Form Edit',
        data: {},
    },
    {
        path: 'formView',
        loadComponent: () => import('form/formView/formView.component').then(c => c.FormViewComponent),
        title: 'Form View',
        data: { preload: false },
    },
    { path: 'form', redirectTo: '/form/search', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('login/login.component').then(c => c.LoginComponent),
        resolve: { lastRoute: LoginResolve },
        title: 'Login',
        data: { preload: false },
    },
    {
        path: 'myBoards',
        loadComponent: () => import('board/myBoards/myBoards.component').then(c => c.MyBoardsComponent),
        title: 'My Boards',
        data: { preload: false },
    },
    {
        path: 'offline',
        component: OfflineComponent,
        title: 'Offline',
        data: { preload: false },
    },
    {
        path: 'resources',
        loadComponent: () => import('resources/resources.component').then(c => c.ResourcesComponent),
        resolve: { resource: ResourceResolve },
        title: 'Resources',
        data: { preload: false },
    },
    {
        path: 'settings',
        loadChildren: () => import('settings/settings.module').then(m => m.SettingsModule),
        canActivate: [loggedInGuard],
        title: 'Settings',
        data: { preload: false },
    },
    {
        path: 'whatsNew',
        loadComponent: () => import('article/article.component').then(c => c.ArticleComponent),
        title: `What's New`,
        data: { article: 'whatsNew', preload: false },
    },
    {
        path: 'nihDataSharing',
        loadComponent: () => import('article/article.component').then(c => c.ArticleComponent),
        title: `NIH Data Sharing`,
        data: { article: 'nihDataSharing', preload: false },
    },
    {
        path: 'guides',
        loadComponent: () => import('guide/guide.component').then(c => c.GuideComponent),
        title: 'Guides',
        data: { preload: false },
    },
    {
        path: 'videos',
        loadComponent: () => import('videos/videos.component').then(c => c.VideosComponent),
        resolve: { videos: VideosResolve },
        title: 'Videos',
        data: { preload: false },
    },
    {
        path: 'searchPreferences',
        loadComponent: () =>
            import('searchPreferences/searchPreferences.component').then(c => c.SearchPreferencesComponent),
        canActivate: [loggedInGuard],
        title: 'Search Preferences',
        data: { preload: false },
    },
    {
        path: 'siteAudit',
        loadChildren: () => import('siteAudit/siteAudit.module').then(m => m.SiteAuditModule),
        canActivate: [orgAuthorityGuard],
        title: 'Audit',
        data: { preload: false },
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
        path: '**',
        component: PageNotFoundComponent,
        title: 'Page Not Found',
        data: { preload: false },
    },
];
