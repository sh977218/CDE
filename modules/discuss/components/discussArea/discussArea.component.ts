import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { UserService } from '_app/user.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { Comment } from 'discuss/discuss.model';

const tabMap = {
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
    templateUrl: './discussArea.component.html',
    styles: [`
    `]
})
export class DiscussAreaComponent {
    private ownElt;
    private _elt;
    @Input() set elt(e) {
        this.ownElt = this.isAllowedModel.doesUserOwnElt(e);
        console.log('discuss area component ownElt: ' + this.ownElt);
        this._elt = e;
    }

    get elt() {
        return this._elt;
    }

    @Input() public eltId: string;
    @Input() public eltName: string;

    private _currentTab = 'general_tab';
    @Input() set currentTab(tab: string) {
        this._currentTab = tabMap[tab];
    }

    get currentTab() {
        return this._currentTab;
    }

    @Input() highlightedTabs = [];
    @Output() highlightedTabsChange = new EventEmitter();
    newComment: Comment = new Comment();

    constructor(private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public userService: UserService) {
    }

    postNewComment() {
        this.http.post('/comments/' + this._elt.elementType + '/add', {
            comment: this.newComment.text,
            linkedTab: this._currentTab,
            element: {eltId: this.eltId}
        }).subscribe(() => this.newComment.text = '');
    }

}
