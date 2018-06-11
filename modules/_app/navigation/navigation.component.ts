import { Component, EventEmitter, Output } from '@angular/core';
import { LoginService } from '_app/login.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { canCreateForms, canOrgAuthority, isOrgAdmin, isOrgCurator, isSiteAdmin } from 'shared/system/authorizationShared';
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material";

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

    settingsSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n" +
        "    <path fill=\"none\" d=\"M0 0h20v20H0V0z\"/>\n" +
        "    <path d=\"M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z\"/>\n" +
        "</svg>";

    constructor(public userService: UserService,
                public quickBoardService: QuickBoardListService,
                public loginSvc: LoginService,
                iconRegistry: MatIconRegistry,
                sanitizer: DomSanitizer
    ) {
        iconRegistry.addSvgIconLiteral('settings', sanitizer.bypassSecurityTrustHtml(this.settingsSvg));
    }

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }
}
