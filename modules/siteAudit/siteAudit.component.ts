import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatTab} from '@angular/material/tabs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {UserService} from '_app/user.service';
import {isSiteAdmin} from 'shared/security/authorizationShared';
import {noop} from 'shared/util';
import {map} from "rxjs/operators";

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html'
})
export class SiteAuditComponent implements AfterViewInit {
    isAdmin = false;
    selectedTab = new FormControl(0);

    constructor(public userService: UserService,
                private route: ActivatedRoute) {
        this.userService.then(user => this.isAdmin = isSiteAdmin(user), noop);
    }

    ngAfterViewInit(): void {
        this.route.queryParamMap.pipe(
            map((params: ParamMap) => params.get('tab'))
        ).subscribe(tab => {
            if (tab === 'serverErrors') {
                this.selectedTab.setValue(7);
            }
            if (tab === 'clientErrors') {
                this.selectedTab.setValue(8);
            }
        })
    }

}
