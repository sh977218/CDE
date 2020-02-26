import { NgModule } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
