import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { AlertService } from 'alert/alert.service';

@NgModule({
    imports: [
        MatSnackBarModule
    ],
    declarations: [],
    entryComponents: [],
    providers: [
        AlertService
    ],
    exports: [],
    schemas: []
})

export class AlertModule {
}
