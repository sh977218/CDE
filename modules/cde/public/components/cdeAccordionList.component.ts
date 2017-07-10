import { Component, Inject, Input } from "@angular/core";

@Component({
    selector: "cde-accordion-list",
    templateUrl: "./cdeAccordionList.component.html"
})


export class CdeAccordionListComponent {

    @Input() cdes;

    constructor(@Inject("isAllowedModel") public isAllowedModel) {
    }

}
