import { Directive, ElementRef, Injector, Output, Input, EventEmitter } from "@angular/core";
import { UpgradeComponent } from "@angular/upgrade/static";
/* tslint:disable */
@Directive({
    selector: "inline-select-edit"
})
export class InlineSelectEditDirective extends UpgradeComponent {
    @Input() model: any;
    @Input() allOptions: any;
    @Input() isAllowed: any;
    @Output() onOk: EventEmitter<void>;
    constructor(elementRef: ElementRef, injector: Injector) {
        super("inlineSelectEdit", elementRef, injector);
    }
}
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
    selector: "inline-area-edit"
})
export class InlineAreaEditDirective extends UpgradeComponent {
    @Input() model: any;
    @Output() modelChange: EventEmitter<void>;
    @Input() isAllowed: any;
    @Output() onOk: EventEmitter<void>;
    @Output() onErr: EventEmitter<void>;
    @Input() defFormat: any;
    @Output() defFormatChange: EventEmitter<void>;
    constructor(elementRef: ElementRef, injector: Injector) {
        super("inlineEdit", elementRef, injector);
    }
}

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
