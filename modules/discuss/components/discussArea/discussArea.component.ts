import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { UserService } from '_app/user.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { Comment } from 'shared/models.model';
import { AlertService } from 'alert/alert.service';

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
    templateUrl: './discussArea.component.html'
})
export class DiscussAreaComponent {
    newComment: Comment = new Comment();
    private ownElt;
    private _elt;
    @Input() set elt(e) {
        this.ownElt = this.isAllowedModel.doesUserOwnElt(e);
        if (!this.newComment.element) { this.newComment.element = {}; }
        this.newComment.element.eltType = e.elementType;
        this.newComment.element.eltId = e.tinyId ? e.tinyId : e.id;
        this.eltId = e.tinyId ? e.tinyId : e.id;
        this._elt = e;
    }

    get elt() {
        return this._elt;
    }

    @Input() public eltName: string;

    private _currentTab = 'general_tab';
    @Input() set currentTab(tab: string) {
        this._currentTab = tabMap[tab];
        this.newComment.linkedTab = this._currentTab;
    }

    get currentTab() {
        return this._currentTab;
    }

    @Input() highlightedTabs = [];
    @Output() highlightedTabsChange = new EventEmitter();
    eltId: string;

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
