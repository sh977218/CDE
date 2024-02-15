import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    templateUrl: './inactivity-logged-out-modal.component.html',
    imports: [MatDialogModule],
    standalone: true,
})
export class InactivityLoggedOutModalComponent {}
