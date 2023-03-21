import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { BoardCdeSummaryListComponent } from 'cde/listView/boardCdeSummaryList.component';
import { BoardFormSummaryListComponent } from 'form/listView/boardFormSummaryList.component';
import { CdeAccordionListComponent } from 'cde/listView/cdeAccordionList.component';
import { ElasticService } from '_app/elastic.service';
import { Elt, Item, ListTypes } from 'shared/models.model';
import { CdeSummaryListContentComponent } from 'cde/listView/cdeSummaryListContent.component';
import { FormAccordionListComponent } from 'form/listView/formAccordionList.component';
import { FormSummaryListContentComponent } from 'form/listView/formSummaryListContent.component';
import { SummaryListComponent } from 'search/listView/summaryList.component';
import { TableListComponent } from 'search/listView/tableList.component';

@Component({
    selector: 'cde-list-view',
    templateUrl: './listView.component.html',
})
export class ListViewComponent implements OnChanges, OnInit {
    @Input() board?: any = null;
    @Input() currentPage = 0;
    @Input() location?: string = undefined;
    @Input() elts!: Elt[];
    @Input() embedded = false;
    @Input() listView!: ListTypes;
    @Input() module!: string;
    @Input() totalItems = 0;
    @Output() add = new EventEmitter<Item>();
    @Output() listViewChange = new EventEmitter<string>();
    @ViewChild('viewContainer', { read: ViewContainerRef, static: true }) viewContainer!: ViewContainerRef;
    private _listView?: ListTypes;
    viewsMap!: Map<string, any>;
    viewComponentRef: any;

    constructor(private _componentFactoryResolver: ComponentFactoryResolver, private esService: ElasticService) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elts && this.viewComponentRef && this.viewComponentRef.instance) {
            this.viewComponentRef.instance.elts = this.elts;
        }
        if (changes.board && this.viewComponentRef?.instance && this.location === 'board') {
            this.viewComponentRef.instance.board = this.board;
            this.viewComponentRef.instance.currentPage = this.currentPage;
            this.viewComponentRef.instance.totalItems = this.totalItems;
        }

        if (changes.module) {
            this.viewsMap = new Map();
            this.viewsMap.set('table', TableListComponent);
            if (this.module === 'cde') {
                this.viewsMap.set('accordion', CdeAccordionListComponent);
                if (this.location === 'board') {
                    this.viewsMap.set('summary', BoardCdeSummaryListComponent);
                } else {
                    this.viewsMap.set('summary', SummaryListComponent);
                    this.viewsMap.set('summaryContent', CdeSummaryListContentComponent);
                }
            }
            if (this.module === 'form') {
                this.viewsMap.set('accordion', FormAccordionListComponent);
                if (this.location === 'board') {
                    this.viewsMap.set('summary', BoardFormSummaryListComponent);
                } else {
                    this.viewsMap.set('summary', SummaryListComponent);
                    this.viewsMap.set('summaryContent', FormSummaryListContentComponent);
                }
            }
        }

        if (changes.listView) {
            this.setListView(this.listView);
        }
    }

    ngOnInit() {
        if (!this._listView) {
            setTimeout(() => {
                if (
                    !this.setListView(
                        window.localStorage[
                            'nlmcde.' + (this.location ? this.location + '-' : '') + this.module + '-searchViewType'
                        ]
                    )
                ) {
                    this.setListView(this.esService.getDefaultSearchView());
                }
            }, 0);
        }
    }

    render() {
        if (this.embedded) {
            this._listView = 'accordion';
        }
        const view = this.viewsMap.get(this._listView as string);
        const viewFactory = this._componentFactoryResolver.resolveComponentFactory(view);
        this.viewContainer.clear();
        this.viewComponentRef = this.viewContainer.createComponent(viewFactory);
        this.viewComponentRef.instance.elts = this.elts;
        if (this._listView === 'accordion') {
            this.viewComponentRef.instance.location = this.location;
            this.viewComponentRef.instance.openInNewTab = true;
            if (this.embedded) {
                this.viewComponentRef.instance.addMode = 0;
            }
            this.viewComponentRef.instance.add.subscribe((elt: Item) => this.add.emit(elt));
        } else if (this.location === 'board' && this._listView !== 'table') {
            this.viewComponentRef.instance.board = this.board;
            this.viewComponentRef.instance.currentPage = this.currentPage;
            this.viewComponentRef.instance.totalItems = this.totalItems;
            this.viewComponentRef.instance.reload.subscribe(() => this.add.emit());
        } else if (this._listView === 'table') {
            this.viewComponentRef.instance.module = this.module;
        } else if (this._listView === 'summary') {
            this.viewComponentRef.instance.contentComponent = this.viewsMap.get(this._listView + 'Content');
        }
    }

    setListView(viewType: ListTypes) {
        if (viewType && viewType !== this._listView && ListViewComponent.RESULTVIEWS.indexOf(viewType) > -1) {
            this._listView = viewType;
            if (this._listView === 'summary' || this._listView === 'table') {
                window.localStorage[
                    'nlmcde.' + (this.location ? this.location + '-' : '') + this.module + '-searchViewType'
                ] = this._listView;
            }
            this.render();
            this.listViewChange.emit(this._listView);
            return true;
        }
        return false;
    }

    static readonly RESULTVIEWS = ['accordion', 'summary', 'table'];
}
