import { Component, EventEmitter, Inject, Input, Output, ViewChild } from "@angular/core";
import { SharedService } from "../../../core/public/shared.service";


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
    @Output() takeATour: EventEmitter<void> = new EventEmitter<void>();
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();

    authShared = SharedService.auth;
    smallContext = {$implicit: "collapse"};
    largeContext = {$implicit: ""};

    constructor(@Inject("userResource") public userService) {}

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }
}
