import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { DataElementViewService } from 'cde/public/components/dataElementView.service';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { OrgHelperService } from 'core/orgHelper.service';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import _cloneDeep from 'lodash/cloneDeep';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Comment } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { checkPvUnicity } from 'shared/de/deValidator';
import { canEditCuratedItem, isOrgCurator } from 'shared/system/authorizationShared';

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
    @ViewChild('copyDataElementContent') copyDataElementContent: TemplateRef<any>;
    @ViewChild('tabSet') tabSet: NgbTabset;
    commentMode;
    currentTab = 'general_tab';
    deId;
    displayStatusWarning;
    draftSubscription: Subscription;
    elt: DataElement;
    eltCopy = {};
    hasComments;
    hasDrafts = false;
    highlightedTabs = [];
    isOrgCurator = isOrgCurator;
    modalRef: MatDialogRef<TemplateRef<any>>;
    tabsCommented = [];
    savingText: String;
    tinyId;
    url;

    ngOnInit() {
        this.eltLoad(this.route.data.pipe(map((data: { elt: DataElement }) => data.elt)), () => {
            this.elt.usedBy = this.orgHelperService.getUsedBy(this.elt);
        });
    }

    constructor(private deViewService: DataElementViewService,
                private http: HttpClient,
                private route: ActivatedRoute,
                private router: Router,
                private ref: ChangeDetectorRef,
                private dialog: MatDialog,
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private alert: AlertService,
                public userService: UserService) {
    }

    canEdit() {
        return canEditCuratedItem(this.userService.user, this.elt);
    }

    eltLoad(getElt: Observable<DataElement> | Promise<DataElement> | DataElement, cb = _noop) {
        if (getElt instanceof Observable) {
            getElt.subscribe(
                elt => this.eltLoaded(elt, cb),
                () => this.router.navigate(['/pageNotFound'], {skipLocationChange: true})
            );
        } else if (getElt instanceof Promise) {
            getElt.then(
                elt => this.eltLoaded(elt, cb),
                () => this.router.navigate(['/pageNotFound'], {skipLocationChange: true})
            );
        } else {
            this.eltLoaded(getElt, cb);
        }
    }

    eltLoaded(elt: DataElement, cb = _noop) {
        if (elt) {
            if (elt.isDraft) this.hasDrafts = true;
            DataElement.validate(elt);
            this.elt = elt;
            this.loadComments(this.elt);
            this.deId = this.elt._id;
            if (this.userService.user) {
                checkPvUnicity(this.elt.valueDomain);
            }
            this.displayStatusWarning = (() => {
                if (!this.elt || this.elt.archived || this.userService.user && this.userService.user.siteAdmin) {
                    return false;
                }
                return isOrgCurator(this.userService.user, this.elt.stewardOrg.name) &&
                    (this.elt.registrationState.registrationStatus === 'Standard' ||
                        this.elt.registrationState.registrationStatus === 'Preferred Standard');
            })();
            cb();
        }
    }

    loadComments(de, cb = _noop) {
        this.http.get<Comment[]>('/server/discuss/comments/eltId/' + de.tinyId)
            .subscribe(res => {
                this.hasComments = res && (res.length > 0);
                this.tabsCommented = res.map(c => c.linkedTab + '_tab');
                cb();
            }, err => this.alert.httpErrorMessageAlert(err, 'Error loading comments.'));
    }

    loadElt(cb = _noop) {
        this.eltLoad(this.deViewService.fetchEltForEditing(this.route.snapshot.queryParams), cb);
    }

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    loadPublished(cb = _noop) {
        this.eltLoad(this.deViewService.fetchPublished(this.route.snapshot.queryParams), cb);
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
        this.eltCopy['designations'] = this.eltCopy['designations'];
        this.eltCopy['designations'][0].designation = 'Copy of: ' + this.eltCopy['designations'][0].designation;
        this.eltCopy['definitions'] = this.eltCopy['definitions'];
        this.eltCopy['registrationState'] = {
            registrationStatus: 'Incomplete',
            administrativeNote: 'Copy of: ' + this.elt.tinyId
        };
        this.modalRef = this.dialog.open(this.copyDataElementContent, {width: '1200px'});
    }

    setCurrentTab(currentTab) {
        this.currentTab = currentTab;
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
        this.http.delete('/draftDataElement/' + this.elt.tinyId, {responseType: 'text'}).subscribe(
            () => this.loadElt(() => this.hasDrafts = false),
            err => this.alert.httpErrorMessageAlert(err)
        );
    }

    saveDraft() {
        let username = this.userService.user.username;
        this.elt._id = this.deId;
        if (!this.elt.createdBy) {
            this.elt.createdBy = {username: username, userId: undefined};
        }
        this.elt.updated = new Date();
        if (!this.elt.updatedBy) {
            this.elt.updatedBy = {username: username, userId: undefined};
        }
        this.elt.updatedBy.username = username;

        this.elt.isDraft = true;
        this.hasDrafts = true;
        this.savingText = 'Saving ...';
        if (this.draftSubscription) this.draftSubscription.unsubscribe();
        this.draftSubscription = this.http.post('/draftDataElement/' + this.elt.tinyId, this.elt).subscribe(res => {
            this.savingText = 'Saved';
            setTimeout(() => {
                this.savingText = '';
            }, 3000);
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    saveDataElement() {
        this.http.put('/dePublish/' + this.elt.tinyId, this.elt).subscribe(res => {
            if (res) {
                this.hasDrafts = false;
                this.loadElt(() => this.alert.addAlert('success', 'Data Element saved.'));
            }
        }, () => this.alert.addAlert('danger', 'Sorry, we are unable to retrieve this data element.'));
    }

    viewChanges() {
        let tinyId = this.route.snapshot.queryParams['tinyId'];
        let draftEltObs = this.http.get<DataElement>('/draftDataElement/' + tinyId);
        let publishedEltObs = this.http.get<DataElement>('/de/' + tinyId);
        forkJoin([draftEltObs, publishedEltObs]).subscribe(res => {
            if (res.length = 2) {
                let data = {newer:  res[0], older: res[1]};
                this.dialog.open(CompareHistoryContentComponent, {width: '1000px', data: data});
            } else this.alert.addAlert('danger', 'Error loading view changes. ');
        }, err => this.alert.addAlert('danger', 'Error loading view change. ' + err));
    }
}
