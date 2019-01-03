import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';

import { OrgAdminComponent } from 'system/public/components/siteAdmin/orgAdmin/orgAdmin.component';
import { UsersMgtComponent } from 'system/public/components/siteAdmin/usersMgt/usersMgt.component';
import { WidgetModule } from 'widget/widget.module';
import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';
import { MatButtonModule, MatDialogModule, MatIconModule } from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        NgSelectModule,
        WidgetModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        UsernameAutocompleteModule,
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
