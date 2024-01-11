import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfflineComponent } from '_app/routing/offline.component';
import { PageNotFoundComponent } from '_app/routing/pageNotFound.component';
import { FormResolve } from 'form/formDescription/form.resolve';
import { LoginFederatedComponent } from '_app/loginFederated.component';
import { loggedInGuard } from '_app/routerGuard/loggedInGuard';
import { classifyGuard } from '_app/routerGuard/classifyGuard';
import { orgAuthorityGuard } from '_app/routerGuard/orgAuthorityGuard';
import { ManagedOrgsResolve } from 'settings/managedOrgsResolve';
import { ClassificationService } from 'non-core/classification.service';
import { LoginResolve } from '../login/login.resolve';
import { ResourceResolve } from 'resources/resources.resolve';
import { VideosResolve } from '../videos/videos.resolve';

const appRoutes: Routes = [
    {
        path: 'loginFederated',
        component: LoginFederatedComponent,
    },
    {
        path: 'api',
        loadComponent: () => import('swagger/swagger.component').then(c => c.SwaggerComponent),
        data: { title: 'API Documentation', preload: false },
    },
    {
        path: 'about',
        loadComponent: () => import('about/about.component').then(c => c.AboutComponent),
        data: { title: 'About', preload: false },
    },
    {
        path: 'board/:boardId',
        loadComponent: () => import('board/boardView/boardView.component').then(c => c.BoardViewComponent),
        data: { title: 'Board View', preload: false },
    },
    {
        path: 'home',
        loadChildren: () => import('home/home.module').then(m => m.HomeModule),
        data: { preload: false },
    },
    {
        path: 'cde/search',
        loadComponent: () => import('cde/search/cdeSearch.component').then(c => c.CdeSearchComponent),
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
        loadComponent: () =>
            import('classificationManagement/orgClassificationManagement/orgClassificationManagement.component').then(
                c => c.OrgClassificationManagementComponent
            ),
        resolve: {
            orgs: ManagedOrgsResolve,
        },
        canActivate: [classifyGuard],
        data: { title: 'Manage Org Classification', preload: false },
    },
    {
        path: 'collection',
        loadChildren: () => import('submission/submission.module').then(m => m.SubmissionModule),
        data: { title: 'Collections', preload: false },
    },
    {
        path: 'createCde',
        loadComponent: () =>
            import('cde/createDataElement/createDataElement.component').then(c => c.CreateDataElementComponent),
        canActivate: [loggedInGuard],
        data: { title: 'Create Data Element', preload: false },
    },
    {
        path: 'createForm',
        loadComponent: () => import('form/createForm/createForm.component').then(c => c.CreateFormComponent),
        canActivate: [loggedInGuard],
        data: { title: 'Create Form', preload: false },
    },
    {
        path: 'deView',
        loadComponent: () =>
            import('cde/dataElementView/dataElementView.component').then(c => c.DataElementViewComponent),
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
        canActivate: [loggedInGuard],
        data: { title: 'Form Edit' },
    },
    {
        path: 'formView',
        loadComponent: () => import('form/formView/formView.component').then(c => c.FormViewComponent),
        data: { title: 'Form View', preload: false },
    },
    { path: 'form', redirectTo: '/form/search', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('login/login.component').then(c => c.LoginComponent),
        resolve: { lastRoute: LoginResolve },
        data: { title: 'Login', preload: false },
    },
    {
        path: 'ieDiscontinued',
        loadComponent: () => import('ie-discontinued/ieDiscontinued.component').then(c => c.IeDiscontinuedComponent),
        data: { title: 'Upgrade Browser', preload: false },
    },
    {
        path: 'myBoards',
        loadComponent: () => import('board/myBoards/myBoards.component').then(c => c.MyBoardsComponent),
        data: { title: 'My Boards', preload: false },
    },
    {
        path: 'offline',
        component: OfflineComponent,
        data: { title: 'Offline', preload: false },
    },
    {
        path: 'resources',
        loadComponent: () => import('resources/resources.component').then(c => c.ResourcesComponent),
        resolve: { resource: ResourceResolve },
        data: { title: 'Resources', preload: false },
    },
    {
        path: 'settings',
        loadChildren: () => import('settings/settings.module').then(m => m.SettingsModule),
        canActivate: [loggedInGuard],
        data: { title: 'Settings', preload: false },
    },
    {
        path: 'whatsNew',
        loadComponent: () => import('article/article.component').then(c => c.ArticleComponent),
        data: { title: `What's New`, article: 'whatsNew', preload: false },
    },
    {
        path: 'nihDataSharing',
        loadComponent: () => import('article/article.component').then(c => c.ArticleComponent),
        data: { title: `NIH Data Sharing`, article: 'nihDataSharing', preload: false },
    },
    {
        path: 'guides',
        loadComponent: () => import('guide/guide.component').then(c => c.GuideComponent),
        data: { title: 'Guides', preload: false },
    },
    {
        path: 'videos',
        loadComponent: () => import('videos/videos.component').then(c => c.VideosComponent),
        resolve: { videos: VideosResolve },
        data: { title: 'Videos', preload: false },
    },
    {
        path: 'searchPreferences',
        loadComponent: () =>
            import('searchPreferences/searchPreferences.component').then(c => c.SearchPreferencesComponent),
        canActivate: [loggedInGuard],
        data: { title: 'Search Preferences', preload: false },
    },
    {
        path: 'siteAudit',
        loadChildren: () => import('siteAudit/siteAudit.module').then(m => m.SiteAuditModule),
        canActivate: [orgAuthorityGuard],
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
    providers: [ManagedOrgsResolve, ClassificationService],
    exports: [RouterModule],
})
export class CdeAppRoutingModule {}
