import { Directive, ElementRef, Injector, Input, Output, EventEmitter } from "@angular/core";
import { UpgradeComponent } from "@angular/upgrade/static";

/* tslint:disable */
@Directive({
    selector: "inline-edit"
})
export class InlineEditDirective extends UpgradeComponent {
    @Input() model: any;
    @Output() modelChange: EventEmitter<void>;
    @Input() inputType: any;
    @Input() isAllowed: any;
    @Output() onOk: EventEmitter<void>;
    @Input() typeaheadSource: any;
    @Input() linkSource: any;
    constructor(elementRef: ElementRef, injector: Injector) {
        super("inlineEdit", elementRef, injector);
    }
}

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

@Directive({
    selector: "form-summary-list"
})
export class FormSummaryListDirective extends UpgradeComponent {
    @Input() forms: any;
    @Input() ejsPage: any;
    @Input() module: any;
    @Input() includeInAccordion: any;
    constructor(elementRef: ElementRef, injector: Injector) {
        super("formSummaryList", elementRef, injector);
    }
}
/* tslint:enable */
