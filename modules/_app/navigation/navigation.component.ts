import { Component, EventEmitter, Output } from '@angular/core';
import { LoginService } from '_app/login.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { canCreateForms, canOrgAuthority, isOrgAdmin, isOrgCurator, isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-navigation',
    templateUrl: './navigation.component.html',
    styles: [`
        .navbar-nav > li > a {
            padding-left: 15px;
            padding-right: 15px;
        }
        .mat-toolbar {
            background: #343a40;
        }
        .toolbarItem {
            margin: 0.8em;
        }
        a.active {
            color: rgb(255, 255, 255);
        }
        .mat-toolbar a:not(.active):not(:hover) {
            color: rgba(255, 255, 255, 0.53);
        }
        a {
            text-decoration: none;
            font-size: 1rem;
        }
        .toolbarItem:hover {
            color: rgba(255, 255, 255, 0.75) !important;
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
    isSiteAdmin = isSiteAdmin;

    constructor(public userService: UserService,
                public quickBoardService: QuickBoardListService,
                public loginSvc: LoginService) {
    }

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }
}
