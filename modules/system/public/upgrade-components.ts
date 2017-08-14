import { Directive, ElementRef, Injector, Input, Output, EventEmitter } from "@angular/core";
import { UpgradeComponent } from "@angular/upgrade/static";

/* tslint:disable */
@Directive({
    selector: "cde-select-board"
})
export class SelectBoardDirective extends UpgradeComponent {
    constructor(elementRef: ElementRef, injector: Injector) {
        super("cdeSelectBoard", elementRef, injector);
    }
}
/* tslint:enable */
