import { Component, Inject, Input } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-admin-item-sources",
    templateUrl: "./sources.component.html"
})


export class SourcesComponent {

    @Input() elt: any;

}