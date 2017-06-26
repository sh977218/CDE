import { Injectable } from "@angular/core";
import * as Tour from "../../../node_modules/bootstrap-tour/build/js/bootstrap-tour-standalone.js";
import * as $ from "../../../node_modules/jquery/dist/jquery.js";

const navigationSteps: Array<any> = [
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
        content: "Here's where you can find more documentation about this site or start this tour again.",
        onNext: function (t) {
            document.getElementById("menu_cdes_link").click();
            t.goTo(6);
        }
    }
];

const searchResultSteps: Array<any> = [
    {
        element: "#browseByClassification",
        title: "Search by Classification",
        onNext: function () {
            console.log("on next browser by classification");
        }
    },
    {
        element: "#browseByTopic",
        title: "Search by Topic",
        onNext: function () {
            console.log("on next browser by topic");
        }
    },
    {
        element: "#search_by_classification_NLM",
        title: "Search by Organization",
        onNext: function (t) {
            document.getElementById("search_by_classification_NLM").click();
            t.goTo(9);
        }
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
        title: "Element Name",
        onNext: function (t) {
            document.getElementById("linkToElt_0").click();
            t.goTo(14);
        }
    }
];

const cdeSteps: Array<any> = [
    {
        element: "#discussBtn",
        title: "Discussions",
        content: "This button allow users to post comments on any given CDEs. ",
        placement: "bottom"
    },
    {
        element: "#copyCdeBtn",
        title: "Copy",
        content: "This button can make a copy of this CDE.",
        placement: "bottom"
    },
    {
        element: "#general_tab",
        title: "General Details",
        content: "This section shows an overview of the CDE attributes."
    },
    {
        element: "#pvs_tab",
        title: "Permissible Values",
        placement: "bottom",
        content: "Click here to see what type of value are allowed by this CDE."
    },
    {
        element: "#description_tab",
        title: "Form Element",
        placement: "bottom",
        content: "Click here to see what questions this form has."
    },
    {
        element: "#naming_tab",
        title: "Names",
        placement: "bottom",
        content: "Any CDE may have multiple names, often given within a particular context."
    },
    {
        element: "#classification_tab",
        title: "Classifications",
        placement: "bottom",
        content: "Classifications describe the way in which an organization may use a CDE. Any CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it."
    },
    {
        element: "#concepts_tab",
        title: "Concepts",
        placement: "bottom",
        content: "Data Elements are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC."
    },
    {
        element: "#referenceDocument_tab",
        title: "Reference Document",
        placement: "bottom",
        content: "This section contains reference documents for the CDE."
    },
    {
        element: "#properties_tab",
        title: "Properties",
        placement: "bottom",
        content: "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process."
    },
    {
        element: "#ids_tab",
        title: "Identifiers",
        placement: "bottom",
        content: "CDE may be identified multiple times across CDE users. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here."
    },
    {
        element: "#attachments_tab",
        title: "Attachments",
        content: "If a file is attached to a CDE, it can be view or downloaded here.",
        placement: "bottom"
    },
    {
        element: "#history_tab",
        title: "History",
        content: "This section shows all prior states of the CDE.",
        placement: "bottom"
    },
    {
        element: "#derivationRules_tab",
        title: "Derivation Rules",
        content: "Derivation Rules are used to connect CDEs together, for example, in the form of a score.",
        placement: "bottom"
    },
    {
        element: "#validRules_tab",
        title: "Validation Rules",
        content: "Validation Rules are used to validate CDE. ",
        placement: "bottom"
    },
    {
        element: "#sources_0",
        placement: "top",
        title: "Sources",
        content: "This section shows the where this CDE load from."
    },
    {
        element: "#registrationStateDiv",
        title: "Status",
        placement: "top",
        content: "This section shows the status of the CDE, and optionally dates and/or administrative status."
    },
    {
        element: "#openLinkedBoardsModalBtn",
        title: "Boards",
        content: "If a CDE is used in a public board, the board will be shown in this section.",
        placement: "top"
    },
    {
        element: "#mltButton",
        title: "More Like This",
        content: "This section lists CDEs that are most similar to the CDE currently viewed.",
        placement: "top"
    },
    {
        element: "#openLinkedFormsModalBtn",
        title: "Forms",
        placement: "top",
        content: "If an element is used in a Form, it will be displayed here. "
    },
    {
        element: "#openDataSetModalBtn",
        title: "Data Sets",
        content: "This section lists all data sets this CDE has.",
        placement: "top"
    }
];

@Injectable()
export class TourService {

    static takeATour() {
        let steps = navigationSteps.concat(searchResultSteps).concat(cdeSteps);
        let tour = new Tour({
            name: "CDE-Tour",
            debug: true,
            duration: 2000,
            delay: 2000,
            storage: false,
            steps: steps
        });
        if (localStorage.getItem("CDE-Tour_end") === "yes") {
            tour.restart();
        } else {
            tour.init();
            tour.start();
        }
    }

}


