import { Component, EventEmitter, Output } from '@angular/core';
import { LoginService } from '_app/login.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { canCreateForms, canOrgAuthority, isOrgAdmin, isOrgCurator, isSiteAdmin } from 'shared/system/authorizationShared';
import './navigation.scss';
import '../../../node_modules/material-design-lite/material.css';
import '../../../node_modules/material-design-lite/material.js';

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
        /* Disable ugly boxes around images in IE10 */
        a img {
            border: 0;
        }
        ::-moz-selection {
            background-color: #6ab344;
            color: #fff;
        }
        ::selection {
            background-color: #6ab344;
            color: #fff;
        }
        .android-search-box .mdl-textfield__input {
            color: rgba(0, 0, 0, 0.87);
        }
        .android-header .mdl-menu__container {
            z-index: 50;
            margin: 0 !important;
        }
        .mdl-textfield--expandable {
            width: auto;
        }
        .android-mobile-title {
            display: none !important;
        }
        .android-header {
            overflow: visible;
            background-color: #343a40;
        }
        .android-header .material-icons {
            color: white !important;
        }
        .android-header .mdl-layout__drawer-button {
            background: transparent;
            color: #767777;
        }
        .android-header .mdl-navigation__link {
            color: white;
            font-weight: 700;
            font-size: 14px;
        }
        .android-navigation-container {
            /* Simple hack to make the overflow happen to the left instead... */
            direction: rtl;
            order: 1;
            width: 500px;
            transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
            width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .android-navigation {
            /* ... and now make sure the content is actually LTR */
            direction: ltr;
            justify-content: flex-end;
            width: 800px;
        }
        .android-search-box.is-focused + .android-navigation-container {
            opacity: 0;
            width: 100px;
        }
        .android-navigation .mdl-navigation__link {
            display: inline-block;
            height: 60px;
            line-height: 68px;
            background-color: transparent !important;
            border-bottom: 4px solid transparent;
        }
        .android-navigation .mdl-navigation__link:hover {
            border-bottom: 4px solid rgb(30, 104, 255);
        }
        .android-search-box {
            order: 2;
            margin-left: 16px;
            margin-right: 16px;
        }
        .android-drawer {
            border-right: none;
        }
        .android-drawer-separator {
            height: 1px;
            background-color: #dcdcdc;
            margin: 8px 0;
        }
        .android-drawer .mdl-navigation__link.mdl-navigation__link {
            font-size: 14px;
            color: #757575;
        }
        .android-drawer span.mdl-navigation__link.mdl-navigation__link {
            color: #8bc34a;
        }
        .android-drawer .mdl-layout-title {
            position: relative;
            background: grey;
            height: 160px;
        }
        .android-drawer .logo-image {
            position: absolute;
            bottom: 16px;
        }
        .logo-font {
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1;
            color: #767777;
            font-weight: 500;
        }
        /**** Mobile layout ****/
        @media (max-width: 900px) {
            .android-navigation-container {
                display: none;
            }

            .android-title {
                display: none !important;
            }

            .android-mobile-title {
                display: block !important;
                position: absolute;
                /*left: calc(50% - 70px);*/
                top: 12px;
                transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

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
                public loginSvc: LoginService,
    ) {}

    toggleDrawer = () => (document.querySelector('.mdl-layout') as any).MaterialLayout.toggleDrawer();

}
