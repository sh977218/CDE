import {
    Component, ComponentFactoryResolver, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, Type,
    ViewChild, ViewContainerRef
} from '@angular/core';
import { BoardCdeSummaryListComponent } from 'cde/public/components/listView/boardCdeSummaryList.component';
import { BoardFormSummaryListComponent } from 'form/public/components/listView/boardFormSummaryList.component';
import { CdeAccordionListComponent } from 'cde/public/components/listView/cdeAccordionList.component';
import { Elt } from 'core/public/models.model';
import { CdeSummaryListContentComponent } from 'cde/public/components/listView/cdeSummaryListContent.component';
import { FormAccordionListComponent } from 'form/public/components/listView/formAccordionList.component';
import { FormSummaryListContentComponent } from 'form/public/components/listView/formSummaryListContent.component';
import { QuickBoardCdeSummaryListContentComponent } from 'cde/public/components/listView/quickBoardCdeSummaryListContent.component';
import { QuickBoardFormSummaryListContentComponent } from 'form/public/components/listView/quickBoardFormSummaryListContent.component';
import { SummaryListComponent } from 'search/listView/summaryList.component';
import { TableListComponent } from 'search/listView/tableList.component';

@Component({
    selector: 'cde-list-view',
    templateUrl: './listView.component.html'
})
export class ListViewComponent implements OnChanges, OnInit {
    @Input() board: any = null;
    @Input() currentPage = 0;
    @Input() ejsPage: string = null;
    @Input() elts: Elt[];
    @Input() embedded = false;
    @Input() listView: string;
    @Input() module: string;
    @Input() totalItems: number = 0;
    @Output() add = new EventEmitter<any>();
    @Output() listViewChange = new EventEmitter<string>();
    @ViewChild('viewContainer', {read: ViewContainerRef}) viewContainer: ViewContainerRef;

    private _listView: string;
    viewsMap: Map<string, Type<Component>>;
    viewComponentRef: any;
    static readonly RESULTVIEWS = ['accordion', 'summary', 'table'];

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elts && this.viewComponentRef && this.viewComponentRef.instance)
            this.viewComponentRef.instance.elts = this.elts;
        if (changes.board && this.viewComponentRef && this.viewComponentRef.instance && this.ejsPage === 'board') {
            this.viewComponentRef.instance.board = this.board;
            this.viewComponentRef.instance.currentPage = this.currentPage;
            this.viewComponentRef.instance.totalItems = this.totalItems;
        }

        if (changes.module) {
            this.viewsMap = new Map;
            this.viewsMap.set('table', TableListComponent);
            if (this.module === 'cde') {
                this.viewsMap.set('accordion', CdeAccordionListComponent);
                if (this.ejsPage === 'board') {
                    this.viewsMap.set('summary', BoardCdeSummaryListComponent);
                } else if (this.ejsPage === 'quickBoard') {
                    this.viewsMap.set('summary', SummaryListComponent);
                    this.viewsMap.set('summaryContent', QuickBoardCdeSummaryListContentComponent);
                } else {
                    this.viewsMap.set('summary', SummaryListComponent);
                    this.viewsMap.set('summaryContent', CdeSummaryListContentComponent);
                }
            }
            if (this.module === 'form') {
                this.viewsMap.set('accordion', FormAccordionListComponent);
                if (this.ejsPage === 'board') {
                    this.viewsMap.set('summary', BoardFormSummaryListComponent);
                } else if (this.ejsPage === 'quickBoard') {
                    this.viewsMap.set('summary', SummaryListComponent);
                    this.viewsMap.set('summaryContent', QuickBoardFormSummaryListContentComponent);
                } else {
                    this.viewsMap.set('summary', SummaryListComponent);
                    this.viewsMap.set('summaryContent', FormSummaryListContentComponent);
                }
            }
        }

        if (changes.listView)
            this.setListView(this.listView);
    }

    ngOnInit() {
        if (!this._listView)
            setTimeout(() => {
                if (!this.setListView(window.localStorage['nlmcde.' + this.module + 'searchViewType']))
                    this.setListView(this.searchSettingsService.getDefaultSearchView());
            }, 0);
    }

    constructor(private _componentFactoryResolver: ComponentFactoryResolver,
                @Inject('SearchSettings') private searchSettingsService) {
    }

    render() {
        if (this.embedded)
            this._listView = 'accordion';
        let view = this.viewsMap.get(this._listView);
        let viewFactory = this._componentFactoryResolver.resolveComponentFactory(view);
        this.viewContainer.clear();
        this.viewComponentRef = this.viewContainer.createComponent(viewFactory);
        this.viewComponentRef.instance.elts = this.elts;
        if (this._listView === 'accordion') {
            this.viewComponentRef.instance.ejsPage = this.ejsPage;
            this.viewComponentRef.instance.openInNewTab = true;
            if (this.embedded)
                this.viewComponentRef.instance.addMode = 0;
            this.viewComponentRef.instance.add.subscribe(elt => this.add.emit(elt));
        } else if (this.ejsPage === 'board' && this._listView !== 'table') {
            this.viewComponentRef.instance.board = this.board;
            this.viewComponentRef.instance.currentPage = this.currentPage;
            this.viewComponentRef.instance.totalItems = this.totalItems;
            this.viewComponentRef.instance.reload.subscribe(() => this.add.emit());
        } else if (this._listView === 'table')
            this.viewComponentRef.instance.module = this.module;
        else if (this._listView === 'summary')
            this.viewComponentRef.instance.contentComponent = this.viewsMap.get(this._listView + 'Content');
    }

    setListView(viewType) {
        if (viewType && viewType !== this._listView && ListViewComponent.RESULTVIEWS.indexOf(viewType) > -1) {
            this._listView = viewType;
            window.localStorage['nlmcde.' + this.module + 'searchViewType'] = this._listView;
            this.render();
            this.listViewChange.emit(this._listView);
            return true;
        }
        return false;
    }
}