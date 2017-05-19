import { Directive, ElementRef, EventEmitter, Injector, Input, Output } from "@angular/core";
import { UpgradeComponent } from "@angular/upgrade/static";

/* tslint:disable */
@Directive({
    selector: "cde-form-formSearch"
})
export class FormSearchDirective extends UpgradeComponent {
    @Input() cache: any;
    @Output() cachePut: EventEmitter<any> = new EventEmitter<any>();
    @Output() result: EventEmitter<any>;
    constructor(elementRef: ElementRef, injector: Injector) {
        super("formSearch", elementRef, injector);
    }
}

@Directive({
    selector: "cde-form-questionSearch"
})
export class QuestionSearchDirective extends UpgradeComponent {
    @Input() cache: any;
    @Output() cachePut: EventEmitter<any> = new EventEmitter<any>();
    @Output() result: EventEmitter<any>;
    constructor(elementRef: ElementRef, injector: Injector) {
        super("questionSearch", elementRef, injector);
    }
}
/* tslint:enable */
