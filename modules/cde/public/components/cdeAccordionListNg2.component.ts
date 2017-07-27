import { Component, Inject, Input } from "@angular/core";

@Component({
    selector: "cde-accordion-list-ng2",
    templateUrl: "./cdeAccordionListNg2.component.html"
})
export class CdeAccordionListNg2Component {

    @Input() cdes;

    constructor(@Inject("isAllowedModel") public isAllowedModel) {
    }

}
