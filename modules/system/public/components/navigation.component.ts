import { Component, EventEmitter, Inject, Input, Output, OnInit, AfterViewInit, AfterViewChecked } from "@angular/core";
import { SharedService } from "core/public/shared.service";
import "../../../../node_modules/bootstrap-tour/build/css/bootstrap-tour-standalone.css";
import { LoginService } from "./login/login.service";

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
    @Input() quickBoardCount: number;
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();

    authShared = SharedService.auth;
    smallContext = {$implicit: "collapse"};
    largeContext = {$implicit: ""};
    tour;

    constructor(@Inject("userResource") public userService,
                public loginSvc: LoginService) {
    }

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }
}
