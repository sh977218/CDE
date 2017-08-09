import {
    AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, Directive, EventEmitter, Input,
    OnChanges, Output,
    SimpleChanges,
    ViewChild, ViewContainerRef
} from '@angular/core';
import { Elt } from 'core/public/models.model';

export interface SummaryComponent {
    elt: Elt;
    eltIndex: number;
    select: EventEmitter<string>;
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
    selector: 'cde-summary-list-item',
    templateUrl: './summaryListItem.component.html',
})
export class SummaryListItemComponent implements AfterViewInit, OnChanges {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Input() contentComponent: any;
    @Output() select = new EventEmitter<string>();
    @ViewChild(SummaryPlaceholderDirective) cHost: SummaryPlaceholderDirective;

    componentRef: ComponentRef<any>;

    constructor(private _componentFactoryResolver: ComponentFactoryResolver,
                private cdr: ChangeDetectorRef) {}

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
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.contentComponent);

        let viewContainerRef = this.cHost.viewContainerRef;
        viewContainerRef.clear();

        this.componentRef = viewContainerRef.createComponent(componentFactory);
        (<SummaryComponent>this.componentRef.instance).elt = this.elt;
        (<SummaryComponent>this.componentRef.instance).eltIndex = this.eltIndex;
        (<SummaryComponent>this.componentRef.instance).select.subscribe(event => this.select.emit(event));
        this.cdr.detectChanges();
    }
}
