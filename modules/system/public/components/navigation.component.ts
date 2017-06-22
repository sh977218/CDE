import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
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

    takeATour() {
        localStorage.clear();
        let tour = new Tour({
            name: "CDE-Tour",
            steps: [
                {
                    element: "#menu_cdes_link",
                    title: "CDEs",
                    content: "This menu will take you back to the CDE search page"
                },
                {
                    element: "#menu_forms_link",
                    title: "Forms",
                    content: "This menu will take you to the Form search page"
                },
                {
                    element: "#boardsMenu",
                    title: "Boards",
                    content: "Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them."
                },
                {
                    element: "#menu_qb_link",
                    title: "Quick Board",
                    content: "The quick board is a volatile board for doing quick comparisons or CDE downloads. "
                },
                {
                    element: "#menu_help_link",
                    title: "Help",
                    content: "Here's where you can find more documentation about this site or start this tour again."
                },
                {
                    element: "#search_by_classification_AECC",
                    title: "Search by organization"
                },
                {
                    element: "#resultList",
                    title: "Search Result",
                    content: "This section shows the search result.",
                    placement: "top"
                },
                {
                    element: "#classif_filter_title",
                    content: "This section shows classification filter",
                    title: "Classification Filter"
                },
                {
                    element: "#status_filter",
                    content: "This section shows status filter",
                    title: "Status Filter"
                },
                {
                    element: "#datatype_filter",
                    content: "This section shows data type filter",
                    title: "Data Type Filter"
                }, {
                    element: "#linkToElt_0",
                    content: "This is element name",
                    title: "Element Name"
                }
            ]
        });
        tour.init();
        tour.start();
    }

}
