import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';

import { OrgAdminComponent } from 'system/public/components/siteAdmin/orgAdmin/orgAdmin.component';
import { UsersMgtComponent } from 'system/public/components/siteAdmin/usersMgt/usersMgt.component';
import { WidgetModule } from 'widget/widget.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        NgSelectModule,
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        OrgAdminComponent,
        UsersMgtComponent,
    ],
    entryComponents: [],
    exports: [
        OrgAdminComponent,
        UsersMgtComponent,
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SystemModule {
}
