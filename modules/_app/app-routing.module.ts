import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

import { PageNotFoundComponent } from '_app/pageNotFound/pageNotFoundComponent';

const appRoutes: Routes = [
    {path: 'api', loadChildren: 'system/public/documentApi.module#DocumentApiModule'},
    {path: 'boardList', loadChildren: 'board/public/boardList.module#BoardListModule'},
    {path: 'board/:boardId', loadChildren: 'board/public/boardView.module#BoardViewModule'},
    {path: 'home', loadChildren: 'home/home.module#HomeModule'},
    {path: 'cde/search', loadChildren: 'cde/public/cdeSearchEntry.module#CdeSearchEntryModule'},
    {path: 'cdeStatusReport', loadChildren: 'cde/public/cdeStatusReport.module#CdeStatusReportModule'},
    {path: 'cde', redirectTo: '/cde/search', pathMatch: 'full'},
    {path: 'classificationmanagement', loadChildren: 'system/public/classifManagement.module#ClassifManagementModule'},
    {path: 'createCde', loadChildren: 'cde/public/cdeCreate.module#CdeCreateModule'},
    {path: 'createForm', loadChildren: 'form/public/formCreate.module#FormCreateModule'},
    {path: 'deView', loadChildren: 'cde/public/cdeView.module#CdeViewModule'},
    {path: 'form/search', loadChildren: 'form/public/formSearchEntry.module#FormSearchEntryModule'},
    {path: 'formView', loadChildren: 'form/public/formView.module#FormViewModule'},
    {path: 'form', redirectTo: '/form/search', pathMatch: 'full'},
    {path: 'inbox', loadChildren: 'system/public/inbox.module#InboxModule'},
    {path: 'login', loadChildren: 'system/public/login.module#LoginModule'},
    {path: 'myboards', loadChildren: 'board/public/myBoards.module#MyBoardsModule'},
    {path: 'orgaccountmanagement', loadChildren: 'system/public/orgManagement.module#OrgManagementModule'},
    {path: 'orgAuthority', loadChildren: 'system/public/orgAuthority.module#OrgAuthorityModule'},
    {path: 'orgComments', loadChildren: 'discuss/discussEntry.module#DiscussEntryModule'},
    {path: 'quickBoard', loadChildren: 'quickBoard/quickBoard.module#QuickBoardModule'},
    {path: 'profile', loadChildren: 'system/public/profile.module#ProfileModule'},
    {path: 'sdcview', loadChildren: 'cde/public/sdcView.module#SdcViewModule'},
    {path: 'searchPreferences', loadChildren: 'system/public/searchPreferences.module#SearchPreferencesModule'},
    {path: 'siteaccountmanagement', loadChildren: 'system/public/siteManagement.module#SiteManagementModule'},
    {path: 'siteAudit', loadChildren: 'system/public/siteAudit.module#SiteAuditModule'},
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: '**', component: PageNotFoundComponent}
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                // enableTracing: true, // TODO: dev only
                preloadingStrategy: PreloadAllModules,
            }
        ),
    ],
    exports: [
        RouterModule,
    ]
})
export class CdeAppRoutingModule {
}
