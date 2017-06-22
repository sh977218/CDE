import { Component, EventEmitter, Inject, Input, Output, OnInit } from "@angular/core";
import { SharedService } from "../../../core/public/shared.service";
import "../../../../node_modules/bootstrap-tour/build/css/bootstrap-tour-standalone.css";
import * as Tour from "../../../../node_modules/bootstrap-tour/build/js/bootstrap-tour-standalone.js";

@Component({
    selector: "cde-navigation",
    templateUrl: "./navigation.component.html",
    styles: [`
        .navbar-fixed-top .navbar-collapse {
            max-height: none;
        }
    `]
})
export class NavigationComponent implements OnInit {
    @Input() quickBoardCount: number;
    @Output() goToLogin: EventEmitter<void> = new EventEmitter<void>();
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();

    authShared = SharedService.auth;
    smallContext = {$implicit: "collapse"};
    largeContext = {$implicit: ""};

    constructor(@Inject("userResource") public userService) {
    }

    ngOnInit(): void {
    }

    isPageActive(viewLocation) {
        return viewLocation === window.location.pathname;
    }

    tour = new Tour({
        name: "CDE Tour",
        backdrop: true,
        debug: true,
        steps: [
            {
                element: "#menu_cdes_link",
                title: "Search Board",
                content: "This button will take you to search CDE page."
            },
            {
                element: "#menu_forms_link",
                title: "Search Form",
                content: "This button will take you to search Form page."
            },
            {
                element: "#boardsMenu",
                title: "Search Board",
                content: "This button will take you to search Board page."
            },
            {
                element: "#createEltLink",
                title: "Create ELT",
                content: "This button will take you to create ELT."
            }
        ]
    });

    takeATour() {
        this.tour.init();
        this.tour.start();
    }

}
