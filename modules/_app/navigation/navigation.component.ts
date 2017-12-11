import { Component, EventEmitter, Output } from "@angular/core";
import { SharedService } from "core/shared.service";
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from "_app/user.service";
import { LoginService } from '_app/login.service';

@Component({
    selector: "cde-navigation",
    templateUrl: "./navigation.component.html",
    styles: [`
        .navbar-collapse.collapse.in, .navbar-collapse.collapsing {
            display: block !important;
            width: auto;
        }

        .navbar {
            border-radius: 0;
            padding: 0;
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
