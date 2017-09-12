import { Directive, ElementRef, Injector, Output, Input, EventEmitter } from "@angular/core";
import { UpgradeComponent } from "@angular/upgrade/static";
/* tslint:disable */

@Directive({
    selector: "sortable-array"
})
export class SortableArrayDirective extends UpgradeComponent {
    @Input() theArray: any;
    @Input() index: any;
    @Output() cb: EventEmitter<void>;
    constructor(elementRef: ElementRef, injector: Injector) {
        super("sortableArray", elementRef, injector);
    }
}
/* tslint:enable */
