import { Component } from "@angular/core";
import "rxjs/add/operator/map";
import { AlertService } from "./alert.service";

@Component({
    selector: "cde-alert",
    templateUrl: "./alert.component.html"
})


export class AlertComponent  {

    constructor(public alertSvc: AlertService) {}

}