import {
    AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, Directive, EventEmitter, Input,
    OnChanges, Output,
    SimpleChanges,
    ViewChild, ViewContainerRef
} from '@angular/core';

import { Elt } from 'shared/models.model';

export interface SummaryComponent {
    elt: Elt;
    eltIndex: number;
    selectChange: EventEmitter<string>;
}

@Directive({
    selector: '[cdeSummaryPlaceholder]',
})
export class SummaryPlaceholderDirective {
    @Input() elt!: Elt;
    @Input() eltIndex!: number;
    constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
    selector: 'cde-summary-list-item',
    templateUrl: './summaryListItem.component.html',
})
export class SummaryListItemComponent implements AfterViewInit, OnChanges {
    @Input() elt!: Elt;
    @Input() eltIndex!: number;
    @Input() contentComponent: any;
    @Output() selectChange = new EventEmitter<string>();
    @ViewChild(SummaryPlaceholderDirective, {static: true}) cHost!: SummaryPlaceholderDirective;
    componentRef!: ComponentRef<any>;

    constructor(private _componentFactoryResolver: ComponentFactoryResolver,
                private cdr: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this.loadComponent();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elt && this.componentRef) { (this.componentRef.instance as SummaryComponent).elt = this.elt; }
        if (changes.eltIndex && this.componentRef) { (this.componentRef.instance as SummaryComponent).eltIndex = this.eltIndex; }
    }

    loadComponent() {
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.contentComponent);

        const viewContainerRef = this.cHost.viewContainerRef;
        viewContainerRef.clear();

        this.componentRef = viewContainerRef.createComponent(componentFactory);
        (this.componentRef.instance as SummaryComponent).elt = this.elt;
        (this.componentRef.instance as SummaryComponent).eltIndex = this.eltIndex;
        (this.componentRef.instance as SummaryComponent).selectChange.subscribe((event: string) => this.selectChange.emit(event));
        this.cdr.detectChanges();
    }
}
