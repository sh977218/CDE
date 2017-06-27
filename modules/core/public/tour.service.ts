import { Injectable } from "@angular/core";
import * as Tour from "../../../node_modules/bootstrap-tour/build/js/bootstrap-tour-standalone.js";
import * as $ from "../../../node_modules/jquery/dist/jquery.js";

const navigationSteps: Array<any> = [
    {
        title: "Welcome",
        content: "Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here. Different sections of the applications have different help sections.",
        orphan: true
    },
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
    }
];

const searchResultSteps: Array<any> = [
    {
        path: "/cde/search",
        element: "#browseByClassification",
        title: "Search by Classification"
    },
    {
        element: "#browseByTopic",
        title: "Search by Topic"
    },
    {
        element: "#search_by_classification_NLM",
        title: "Search by Organization",
        placement: "left"
    },
    {
        path: "/cde/search?selectedOrg=NLM",
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
        title: "Element Name"/*,
         onNext: function (t) {
         document.getElementById("linkToElt_0").click();
         t.goTo(14);
         }*/
    }
];

const btnSteps: Array<any> = [
    {
        element: "#addToQuickBoard",
        title: "Add To Quick Board",
        content: "This button allow users to add this element to quick board."
    },
    {
        element: "#addToBoard",
        title: "Add To Board",
        content: "This button allow users to add this element to user's board."
    },
    {
        element: "#export",
        title: "Export",
        content: "This button allow users to export this element to varies format."
    }
];

const cdeSteps: Array<any> = [
    {
        element: "#general_tab",
        title: "General Details",
        content: "This section shows an overview of the CDE attributes."
    },
    {
        element: "#pvs_tab",
        title: "Permissible Values",
        content: "Click here to see what type of value are allowed by this CDE."
    },
    {
        element: "#description_tab",
        title: "Form Element",
        content: "Click here to see what questions this form has."
    },
    {
        element: "#naming_tab",
        title: "Names",
        content: "Any CDE may have multiple names, often given within a particular context."
    },
    {
        element: "#classification_tab",
        title: "Classifications",
        content: "Classifications describe the way in which an organization may use a CDE. Any CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it."
    },
    {
        element: "#concepts_tab",
        title: "Concepts",
        content: "Data Elements are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC."
    },
    {
        element: "#referenceDocument_tab",
        title: "Reference Document",
        content: "This section contains reference documents for the CDE."
    },
    {
        element: "#properties_tab",
        title: "Properties",
        content: "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process."
    },
    {
        element: "#ids_tab",
        title: "Identifiers",
        content: "CDE may be identified multiple times across CDE users. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here."
    },
    {
        element: "#attachments_tab",
        title: "Attachments",
        content: "If a file is attached to a CDE, it can be view or downloaded here."
    },
    {
        element: "#history_tab",
        title: "History",
        content: "This section shows all prior states of the CDE."
    },
    {
        element: "#derivationRules_tab",
        title: "Derivation Rules",
        content: "Derivation Rules are used to connect CDEs together, for example, in the form of a score."
    },
    {
        element: "#validRules_tab",
        title: "Validation Rules",
        content: "Validation Rules are used to validate CDE. "
    },
    {
        element: "#sources_0",
        title: "Sources",
        content: "This section shows the where this CDE load from."
    },
    {
        element: "#registrationStateDiv",
        title: "Status",
        content: "This section shows the status of the CDE, and optionally dates and/or administrative status."
    },
    {
        element: "#openLinkedBoardsModalBtn",
        title: "Boards",
        content: "If a CDE is used in a public board, the board will be shown in this section."
    },
    {
        element: "#mltButton",
        title: "More Like This",
        content: "This section lists CDEs that are most similar to the CDE currently viewed."
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
        onNext: function (t) {
            document.getElementById("openLinkedFormsModalBtn").click();
            document.getElementById("linkToElt_0").click();
            document.getElementById("closeLinkedFormsModalBtn").click();
            t.goTo(35);
        }
    }
];

const formSteps = [
    {
        element: "#description_tab",
        title: "Form Element",
        content: "If the form use questions, they will be here."
    }
];

@Injectable()
export class TourService {

    static takeATour() {
        let steps = navigationSteps.concat(searchResultSteps).concat(btnSteps).concat(cdeSteps).concat(formSteps);
        let tour = new Tour({
            name: "CDE-Tour",
            debug: true,
            //duration: 2000,
            storage: false,
            steps: steps,
            redirect: function (path) {
                if (path === "/cde/search") {
                    document.getElementById("menu_cdes_link").click();
                    tour.goTo(7);
                }
                if (path === "/cde/search?selectedOrg=NLM") {
                    document.getElementById("search_by_classification_NLM").click();
                    tour.goTo(10);
                }
            }
        });
        if (localStorage.getItem("CDE-Tour_end") === "yes") {
            tour.restart();
        } else {
            tour.init();
            tour.start();
        }
    }

}


