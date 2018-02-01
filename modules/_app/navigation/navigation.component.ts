import { Component, EventEmitter, Output } from '@angular/core';

import { LoginService } from '_app/login.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { canCreateForms, canOrgAuthority, isOrgAdmin, isOrgCurator } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-navigation',
    templateUrl: './navigation.component.html',
    styles: [`
        .navbar-nav > li > a {
            padding-left: 15px;
            padding-right: 15px;
        }
    `]
})
export class NavigationComponent {
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();
    canCreateForms = canCreateForms;
    canOrgAuthority = canOrgAuthority;
    isOrgAdmin = isOrgAdmin;
    isOrgCurator = isOrgCurator;
    largeContext = {$implicit: ''};
    smallContext = {$implicit: 'collapse'};

    constructor(public userService: UserService,
                public quickBoardService: QuickBoardListService,
                public loginSvc: LoginService) {
    }

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }
}
