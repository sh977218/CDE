import { Component, EventEmitter, Output } from "@angular/core";
import { SharedService } from "core/public/shared.service";
import "../../../node_modules/bootstrap-tour/build/css/bootstrap-tour-standalone.css";
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { UserService } from "core/public/user.service";
import { LoginService } from 'system/public/components/login/login.service';

@Component({
    selector: "cde-navigation",
    templateUrl: "./navigation.component.html",
    styles: [`
        .navbar-fixed-top .navbar-collapse {
            max-height: none;
        }
    `]
})
export class NavigationComponent {
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();

    authShared = SharedService.auth;
    smallContext = {$implicit: "collapse"};
    largeContext = {$implicit: ""};

    constructor(public userService: UserService,
            public quickBoardService: QuickBoardListService,
            public loginSvc: LoginService) {
    }

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }
}
