import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef, NgbModal, NgbModalModule, NgbTabset, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';
import _noop from 'lodash/noop';
import _uniqWith from 'lodash/uniqWith';
import { Subscription } from 'rxjs/Subscription';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { AlertService } from '_app/alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { Comment } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { checkPvUnicity } from 'shared/de/deValidator';
import { isOrgCurator } from 'shared/system/authorizationShared';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';


@Component({
    selector: 'cde-data-element-view',
    templateUrl: 'dataElementView.component.html',
    styles: [`
        @media (max-width: 767px) {
            .mobileViewH1 {
                font-size: 20px;
            }
        }
    `],
    providers: []
})
export class DataElementViewComponent implements OnInit {
    @ViewChild('commentAreaComponent') commentAreaComponent: DiscussAreaComponent;
    @ViewChild('copyDataElementContent') copyDataElementContent: NgbModalModule;
    @ViewChild('tabSet') tabSet: NgbTabset;

    commentMode;
    currentTab = 'general_tab';
    deId;
    displayStatusWarning;
    drafts = [];
    draftSubscription: Subscription;
    elt: DataElement;
    eltCopy = {};
    hasComments;
    highlightedTabs = [];
    modalRef: NgbModalRef;
    orgNamingTags = [];
    tabsCommented = [];
    savingText: String;
    tinyId;
    url;

    ngOnInit() {
        this.route.queryParams.subscribe(() => {
            this.userService.then(() => {
                this.loadDataElement(() => {
                    this.orgHelperService.then(() => {
                        let org = this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name];
                        let allNamingTags = org ? org.nameTags : [];
                        this.elt.naming.forEach(n => {
                            n.tags.forEach(t => allNamingTags.push(t));
                        });
                        this.orgNamingTags = _uniqWith(allNamingTags, _isEqual).map(t => {
                            return {id: t, text: t};
                        });
                        this.elt.usedBy = this.orgHelperService.getUsedBy(this.elt);
                    }, _noop);
                });
            }, _noop);
        });
    }

    constructor(private http: HttpClient,
                private route: ActivatedRoute,
                private router: Router,
                private ref: ChangeDetectorRef,
                public modalService: NgbModal,
                public isAllowedModel: IsAllowedService,
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private alert: AlertService,
                public userService: UserService) {
    }

    canEdit() {
        return this.isAllowedModel.isAllowed(this.elt) && (this.drafts.length === 0 || this.elt.isDraft);
    }

    eltLoaded(elt: DataElement, cb = _noop) {
        if (elt) {
            elt = new DataElement(elt);
            DataElement.validate(elt);
            this.elt = elt;
            this.loadComments(this.elt);
            this.deId = this.elt._id;
            if (this.userService.user && this.userService.user.username) {
                checkPvUnicity(this.elt.valueDomain);
            }
            this.setDisplayStatusWarning();
            cb();
        }
    }

    loadComments(de, cb = _noop) {
        this.http.get<Comment[]>('/comments/eltId/' + de.tinyId)
            .subscribe(res => {
                this.hasComments = res && (res.length > 0);
                this.tabsCommented = res.map(c => c.linkedTab + '_tab');
                cb();
            }, err => this.alert.httpErrorMessageAlert(err, 'Error loading comments.'));
    }

    loadDataElement(cb = _noop) {
        this.userService.then(user => {
            this.http.get<DataElement>('/draftDataElement/' + this.route.snapshot.queryParams['tinyId']).subscribe(
                res => {
                    if (res && this.isAllowedModel.isAllowed(res)) {
                        this.drafts = [res];
                        this.eltLoaded(res, cb);
                    } else {
                        this.drafts = [];
                        this.loadPublished(cb);
                    }
                },
                err => {
                    // do not load elt
                    this.alert.httpErrorMessageAlert(err);
                    this.eltLoaded(null, cb);
                }
            );
        }, () => {
            this.loadPublished(cb);
        });
    }

    loadPublished(cb = _noop) {
        let cdeId = this.route.snapshot.queryParams['cdeId'];
        let url = '/de/' + this.route.snapshot.queryParams['tinyId'];
        if (cdeId) url = '/deById/' + cdeId;
        this.http.get<DataElement>(url).subscribe(
            res => this.eltLoaded(res, cb),
            () => this.router.navigate(['/pageNotFound'])
        );
    }

    setDisplayStatusWarning() {
        this.userService.then(user => {
            this.displayStatusWarning = (() => {
                if (!this.elt) return false;
                if (this.elt.archived || user.siteAdmin) {
                    return false;
                } else {
                    if (this.userService.userOrgs) {
                        return isOrgCurator(user, this.elt.stewardOrg.name) &&
                            (this.elt.registrationState.registrationStatus === 'Standard' ||
                                this.elt.registrationState.registrationStatus === 'Preferred Standard');
                    } else {
                        return false;
                    }
                }
            })();
        }, _noop);
    }

    openCopyElementModal() {
        this.eltCopy = _cloneDeep(this.elt);
        this.eltCopy['classification'] = this.elt.classification.filter(c => {
            return this.userService.userOrgs.indexOf(c.stewardOrg.name) !== -1;
        });
        this.eltCopy['registrationState.administrativeNote'] = 'Copy of: ' + this.elt.tinyId;
        delete this.eltCopy['tinyId'];
        delete this.eltCopy['_id'];
        delete this.eltCopy['origin'];
        delete this.eltCopy['created'];
        delete this.eltCopy['updated'];
        delete this.eltCopy['imported'];
        delete this.eltCopy['updatedBy'];
        delete this.eltCopy['createdBy'];
        delete this.eltCopy['version'];
        delete this.eltCopy['history'];
        delete this.eltCopy['changeNote'];
        delete this.eltCopy['comments'];
        delete this.eltCopy['forkOf'];
        delete this.eltCopy['views'];
        this.eltCopy['ids'] = [];
        this.eltCopy['sources'] = [];
        this.eltCopy['naming'][0].designation = 'Copy of: ' + this.eltCopy['naming'][0].designation;
        this.eltCopy['registrationState'] = {
            registrationStatus: 'Incomplete',
            administrativeNote: 'Copy of: ' + this.elt.tinyId
        };
        this.modalRef = this.modalService.open(this.copyDataElementContent, {size: 'lg'});
    }

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    setCurrentTab(currentTab) {
        this.currentTab = currentTab;
        if (this.commentMode) this.commentAreaComponent.setCurrentTab(this.currentTab);
    }

    removeAttachment(index) {
        this.http.post<DataElement>('/attachments/cde/remove', {
            index: index,
            id: this.elt._id
        }).subscribe(res => {
            this.elt = res;
            this.alert.addAlert('success', 'Attachment Removed.');
            this.ref.detectChanges();
        });
    }

    setDefault(index) {
        this.http.post<DataElement>('/attachments/cde/setDefault',
            {
                index: index,
                state: this.elt.attachments[index].isDefault,
                id: this.elt._id
            }).subscribe(res => {
            this.elt = res;
            this.alert.addAlert('success', 'Saved');
            this.ref.detectChanges();
        });
    }

    upload(event) {
        let files = event.srcElement.files;
        if (files && files.length > 0) {
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('uploadedFiles', files[i]);
            }
            formData.append('id', this.elt._id);
            this.http.post<any>('/attachments/cde/add', formData).subscribe(
                r => {
                    if (r.message) this.alert.addAlert('info', r);
                    else {
                        this.elt = r;
                        this.alert.addAlert('success', 'Attachment added.');
                        this.ref.detectChanges();
                    }
                }
            );
        }
    }

    removeDraft() {
        this.http.delete('/draftDataElement/' + this.elt.tinyId, {responseType: 'text'})
            .subscribe(() => {
                this.drafts = [];
                this.loadDataElement();
            }, err => this.alert.httpErrorMessageAlert(err));
    }

    saveDraft(cb) {
        this.savingText = 'Saving ...';
        this.elt._id = this.deId;
        let username = this.userService.user.username;
        if (this.elt.updatedBy) this.elt.updatedBy.username = username;
        else this.elt.updatedBy = {username: username, userId: undefined};
        if (this.elt.createdBy) this.elt.createdBy.username = username;
        else this.elt.createdBy = {username: username, userId: undefined};
        this.elt.updated = new Date();
        if (this.draftSubscription) this.draftSubscription.unsubscribe();
        this.draftSubscription = this.http.post('/draftDataElement/' + this.elt.tinyId, this.elt)
            .subscribe(res => {
                this.savingText = 'Saved';
                setTimeout(() => {
                    this.savingText = '';
                }, 3000);
                this.elt.isDraft = true;
                if (!this.drafts.length) this.drafts = [this.elt];
                if (cb) cb(res);
            }, err => this.alert.httpErrorMessageAlert(err));
    }

    saveDataElement() {
        this.http.put('/dePublish/' + this.elt.tinyId, this.elt).subscribe(res => {
            if (res) {
                this.loadDataElement(() => this.alert.addAlert('success', 'Data Element saved.'));
            }
        }, () => this.alert.addAlert('danger', 'Sorry, we are unable to retrieve this data element.'));
    }

    viewChanges() {
        let tinyId = this.route.snapshot.queryParams['tinyId'];
        let draftEltObs = this.http.get<DataElement>('/draftDataElement/' + tinyId);
        let publishedEltObs = this.http.get<DataElement>('/de/' + tinyId);
        forkJoin([draftEltObs, publishedEltObs]).subscribe(res => {
            if (res.length = 2) {
                let newer = res[0];
                let older = res[1];
                const modalRef = this.modalService.open(CompareHistoryContentComponent, {size: 'lg'});
                modalRef.componentInstance.newer = newer;
                modalRef.componentInstance.older = older;

            } else this.alert.addAlert('danger', 'Error loading view changes. ');
        }, err => this.alert.addAlert('danger', 'Error loading view change. ' + err));
    }
}
