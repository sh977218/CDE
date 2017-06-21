import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import { SharedService } from "../../../core/public/shared.service";
import "../../../../node_modules/bootstrap-tour/build/css/bootstrap-tour.css";
import * as Tour from "../../../../node_modules/bootstrap-tour/build/js/bootstrap-tour.js";

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

    constructor(@Inject("userResource") public userService) {
    }

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }

    defaultSteps = [
        {
            element: "#browseCdes",
            title: "Search CDE",
            content: "This button will take you to search CDE page."
        },
        {
            element: "#browseForms",
            title: "Search Form",
            content: "This button will take you to search Form page."
        }
    ];

    takeATour() {
        let tour = new Tour({steps: this.defaultSteps});
        tour.init();
        tour.start();
    }
}
