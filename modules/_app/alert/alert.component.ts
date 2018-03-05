import { Component } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: 'cde-alert',
    templateUrl: './alert.component.html'
})
export class AlertComponent  {
    constructor(public alertSvc: AlertService) {}
}
