import { Directive, ElementRef, Injector, Input, Output, EventEmitter } from "@angular/core";
import { UpgradeComponent } from "@angular/upgrade/static";

/* tslint:disable */
@Directive({
    selector: "cde-accordion-list"
})
export class CdeAccordionListDirective extends UpgradeComponent {
    @Input() cdes: any;
    @Input() ejsPage: any;
    @Input() module: any;

    constructor(elementRef: ElementRef, injector: Injector) {
        super("cdeAccordionList", elementRef, injector);
    }
}

@Directive({
    selector: "form-accordion-list"
})
export class FormAccordionListDirective extends UpgradeComponent {
    @Input() forms: any;
    @Input() ejsPage: any;
    @Input() module: any;

    constructor(elementRef: ElementRef, injector: Injector) {
        super("formAccordionList", elementRef, injector);
    }
}
/* tslint:enable */
