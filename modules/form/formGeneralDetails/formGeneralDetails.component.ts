import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { CdeForm, CopyrightURL } from 'shared/form/form.model';
import { canBundle } from 'shared/security/authorizationShared';
import { DatePipe, NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';
import { TourAnchorMatMenuDirective } from 'ngx-ui-tour-md-menu';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'cde-form-general-details[elt]',
    templateUrl: './formGeneralDetails.component.html',
    styleUrls: ['./formGeneralDetails.component.scss'],
    imports: [
        NgIf,
        MatIconModule,
        FormsModule,
        InlineEditModule,
        NgForOf,
        NgStyle,
        InlineSelectEditModule,
        DatePipe,
        TourAnchorMatMenuDirective,
    ],
    standalone: true,
})
export class FormGeneralDetailsComponent implements OnDestroy {
    @Input() set elt(e: CdeForm) {
        this._elt = e;
    }

    get elt() {
        return this._elt;
    }

    @Input() canEdit = false;
    @Output() eltChange = new EventEmitter();
    @Output() eltReloaded = new EventEmitter<CdeForm>();
    private _elt!: CdeForm;
    canBundle = canBundle;
    options = {
        multiple: false,
        tags: true,
    };
    unsubscribeUser?: () => void;
    userOrgs: string[] = [];

    constructor(private http: HttpClient, public orgHelperService: OrgHelperService, public userService: UserService) {
        this.unsubscribeUser = this.userService.subscribe(() => {
            this.userOrgs = this.userService.userOrgs;
        });
    }

    ngOnDestroy() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
            this.unsubscribeUser = undefined;
        }
    }

    changeStewardOrg(event: string) {
        this.elt.stewardOrg.name = event;
        this.eltChange.emit();
    }

    bundle(form: CdeForm) {
        this.http.post<CdeForm>('/server/form/bundle/' + form.tinyId, undefined).subscribe(elt => {
            this.eltReloaded.emit(elt);
        });
    }

    unbundle(form: CdeForm) {
        this.http.post<CdeForm>('/server/form/unbundle/' + form.tinyId, undefined).subscribe(elt => {
            this.eltReloaded.emit(elt);
        });
    }

    trackByUrl(index: number, url: CopyrightURL) {
        return url.url;
    }
}
