import { Component } from "@angular/core";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

@Component({
    selector: "nih-cde",
    template: `<router-outlet></router-outlet>`
})
export class CdeAppComponent {
    name = "Angular 2";
}
