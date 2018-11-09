import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';

import { WidgetModule } from 'widget/widget.module';
import { ResourcesComponent } from 'resources/resources.component';
import { AdminItemModule } from 'adminItem/public/adminItem.module';

@NgModule({
    imports: [
        CommonModule,
        // core
        WidgetModule,
        AdminItemModule
    ],
    declarations: [
        ResourcesComponent
    ],
    entryComponents: [],
    exports: [ResourcesComponent],
    providers: [],
})
export class ResourcesModule {
}