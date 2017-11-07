import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DiscussModule } from 'discuss/discuss.module';
import { LatestCommentsComponent } from 'discuss/components/latestComments/latestComments.component';


const appRoutes: Routes = [
    {path: '', component: LatestCommentsComponent, data: {commentsUrl: 'orgComments'}},
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        // internal
        DiscussModule,
    ],
    declarations: [
    ],
    entryComponents: [
    ],
    exports: [
    ],
    schemas: []
})
export class DiscussEntryModule {
}
