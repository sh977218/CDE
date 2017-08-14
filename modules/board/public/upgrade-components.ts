import { Directive, ElementRef, EventEmitter, Injector, Input, Output } from "@angular/core";
import { UpgradeComponent } from "@angular/upgrade/static";

/* tslint:disable */
@Directive({
    selector: "cde-elts-compare"
})
export class EltsCompareDirective extends UpgradeComponent {
    @Input() module: string;
    @Input() eltsToCompare: any;

    constructor(elementRef: ElementRef, injector: Injector) {
        super("cdeEltsCompare", elementRef, injector);
    }
}
/* tslint:enable */
