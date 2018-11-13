import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';
import { CKEditorModule } from 'ng2-ckeditor';

import { ResourcesComponent } from 'resources/resources.component';
import { AdminItemModule } from 'adminItem/public/adminItem.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CKEditorModule,
        // core
        AdminItemModule,
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