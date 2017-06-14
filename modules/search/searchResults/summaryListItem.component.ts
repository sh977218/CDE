import {
    AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, SimpleChanges,
    ViewChild,
    ViewContainerRef
} from "@angular/core";

export interface SummaryComponent {
    elt: any;
    eltIndex: any;
}

@Directive({
    selector: '[cdeSummaryPlaceholder]',
})
export class SummaryPlaceholderDirective {
    @Input() elt: any;
    @Input() eltIndex: any;
    constructor (public viewContainerRef: ViewContainerRef) {}
}

@Component({
    selector: "cde-summary-list-item",
    templateUrl: "./summaryListItem.component.html",
})
export class SummaryListItemComponent implements AfterViewInit, OnChanges {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Input() summaryComponent: any;
    @ViewChild(SummaryPlaceholderDirective) cHost: SummaryPlaceholderDirective;

    componentRef: ComponentRef<any>;

    constructor(private _componentFactoryResolver: ComponentFactoryResolver) {}

    ngAfterViewInit() {
        this.loadComponent();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elt && this.componentRef)
            (<SummaryComponent>this.componentRef.instance).elt = this.elt;
        if (changes.eltIndex && this.componentRef)
            (<SummaryComponent>this.componentRef.instance).eltIndex = this.eltIndex;
    }

    loadComponent() {
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.summaryComponent);

        let viewContainerRef = this.cHost.viewContainerRef;
        viewContainerRef.clear();

        this.componentRef = viewContainerRef.createComponent(componentFactory);
        (<SummaryComponent>this.componentRef.instance).elt = this.elt;
        (<SummaryComponent>this.componentRef.instance).eltIndex = this.eltIndex;
    }
}
