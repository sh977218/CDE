import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { Board, Comment, Item } from 'shared/models.model';
import { Dictionary } from 'async';

const tabMap: Dictionary<string> = {
    preview_tab: 'preview',
    meshTopic_tab: 'meshTopic',
    general_tab: 'general',
    description_tab: 'description',
    pvs_tab: 'pvs',
    naming_tab: 'naming',
    classification_tab: 'classification',
    concepts_tab: 'concepts',
    referenceDocuments_tab: 'referenceDocuments',
    properties_tab: 'properties',
    ids_tab: 'ids',
    attachments_tab: 'attachments',
    history_tab: 'history',
    rules_tab: 'derivationRules'
};

@Component({
    selector: 'cde-discuss-area',
    templateUrl: './discussArea.component.html'
})
export class DiscussAreaComponent {
    @Input() set elt(e: Item | Board) {
        this.ownElt = this.isAllowedModel.doesUserOwnElt(e);
        if (!this.newComment.element) { this.newComment.element = {eltType: 'cde', eltId: ''}; }
        this.newComment.element.eltType = e.elementType;
        const id = e.elementType === 'cde' || e.elementType === 'form' ? e.tinyId : e.id;
        this.newComment.element.eltId = id;
        this.eltId = id;
        this._elt = e;
    }
    get elt() {
        return this._elt;
    }
    @Input() public eltName!: string;
    @Input() set currentTab(tab: string) {
        this._currentTab = tabMap[tab];
        this.newComment.linkedTab = this._currentTab;
    }
    get currentTab() {
        return this._currentTab;
    }
    @Output() highlightedTabsChange = new EventEmitter<string[]>(); // unused
    private _currentTab: string = 'general_tab';
    private _elt!: Item | Board;
    eltId!: string;
    newComment: Comment = new Comment();
    private ownElt!: boolean;

    constructor(private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public userService: UserService,
                public alertService: AlertService) {
    }

    postNewComment() {
        this.http.post('/server/discuss/postComment', this.newComment)
            .subscribe(() => this.newComment.text = '',
                err => this.alertService.addAlert('danger', err.error));
    }

}
