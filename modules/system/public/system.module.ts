import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';

import { OrgAdminComponent } from 'system/public/components/siteAdmin/orgAdmin/orgAdmin.component';
import { UsersMgtComponent } from 'system/public/components/siteAdmin/usersMgt/usersMgt.component';
import { MatButtonModule, MatDialogModule, MatIconModule } from '@angular/material';
import { TagModule } from 'tag/tag.module';

import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        NgSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        UsernameAutocompleteModule,
        // internal
        TagModule
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
