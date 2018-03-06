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
        :not(.active) > #menu_cdes_link, :not(.active) > #menu_forms_link, :not(.active) > #menu_qb_link, :not(.active) > #boardsMenu, :not(.active) > #createEltLink, :not(.active) > #menu_help_link, :not(.active) > #username_link, :not(.active) > #login_link {
            color: rgba(255, 255, 255, 0.53);
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
