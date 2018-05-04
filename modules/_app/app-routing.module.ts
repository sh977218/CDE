import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { PageNotFoundComponent } from '_app/pageNotFound/pageNotFound.component';
import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';
import { OrgAdminGuard } from '_app/routerGuard/orgAdminGuard';
import { OrgAuthorityGuard } from '_app/routerGuard/orgAuthorityGuard';
import { OrgCuratorGuard } from '_app/routerGuard/orgCuratorGuard';
import { SiteAdminGuard } from '_app/routerGuard/siteAdminGuard';
import { IdentifierSourcesResolve } from 'system/public/components/searchPreferences/identifier-source.resolve.service';

const appRoutes: Routes = [
    {path: 'api', loadChildren: 'system/public/documentApi.module#DocumentApiModule'},
    {path: 'boardList', loadChildren: 'board/public/boardList.module#BoardListModule'},
    {path: 'board/:boardId', loadChildren: 'board/public/boardView.module#BoardViewModule'},
    {path: 'home', loadChildren: 'home/home.module#HomeModule'},
    {path: 'cde/search', loadChildren: 'cde/public/cdeSearchEntry.module#CdeSearchEntryModule'},
    {path: 'cdeStatusReport', loadChildren: 'cde/public/cdeStatusReport.module#CdeStatusReportModule'},
    {path: 'cde', redirectTo: '/cde/search', pathMatch: 'full'},
    {path: 'classificationmanagement', loadChildren: 'system/public/classifManagement.module#ClassifManagementModule', canLoad: [OrgCuratorGuard]},
    {path: 'createCde', loadChildren: 'cde/public/cdeCreate.module#CdeCreateModule'},
    {path: 'createForm', loadChildren: 'form/public/formCreate.module#FormCreateModule'},
    {path: 'deView', loadChildren: 'cde/public/cdeView.module#CdeViewModule'},
    {path: 'form/search', loadChildren: 'form/public/formSearchEntry.module#FormSearchEntryModule'},
    {path: 'formView', loadChildren: 'form/public/formView.module#FormViewModule'},
    {path: 'form', redirectTo: '/form/search', pathMatch: 'full'},
    {path: 'inbox', loadChildren: 'system/public/inbox.module#InboxModule', canLoad: [LoggedInGuard]},
    {path: 'login', loadChildren: 'system/public/login.module#LoginModule'},
    {path: 'myboards', loadChildren: 'board/public/myBoards.module#MyBoardsModule'},
    {path: 'orgaccountmanagement', loadChildren: 'system/public/orgManagement.module#OrgManagementModule', canLoad: [OrgAdminGuard]},
    {path: 'orgAuthority', loadChildren: 'system/public/orgAuthority.module#OrgAuthorityModule', canLoad: [OrgAuthorityGuard]},
    {path: 'orgComments', loadChildren: 'discuss/discussEntry.module#DiscussEntryModule', canLoad: [OrgCuratorGuard]},
    {path: 'quickBoard', loadChildren: 'quickBoard/quickBoard.module#QuickBoardModule'},
    {path: 'profile', loadChildren: 'system/public/profile.module#ProfileModule', canLoad: [LoggedInGuard]},
    {
        path: 'searchPreferences',
        resolve: {
            identifier: IdentifierSourcesResolve
        },
        loadChildren: 'system/public/searchPreferences.module#SearchPreferencesModule'
    },
    {path: 'siteaccountmanagement', loadChildren: 'system/public/siteManagement.module#SiteManagementModule', canLoad: [SiteAdminGuard]},
    {path: 'siteAudit', loadChildren: 'system/public/siteAudit.module#SiteAuditModule', canLoad: [OrgAuthorityGuard]},
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: '**', component: PageNotFoundComponent}
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
    providers: [
        IdentifierSourcesResolve,
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
