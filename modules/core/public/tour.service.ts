import { Injectable } from "@angular/core";
import * as Tour from "../../../node_modules/bootstrap-tour/build/js/bootstrap-tour-standalone.js";


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
        content: "Here's where you can find more documentation about this site or start this tour again.",
        onNext: tour => {
            let idClick = "menu_cdes_link";
            let idCheck = "browseByClassification";
            let stepGoto = 6;
            tour.end();
            document.getElementById(idClick).click();
            TourService.waitForEltId(idCheck, () => TourService.takeATour(stepGoto));
        }
    }
];

const searchResultSteps: Array<any> = [
    {
        element: "#browseByClassification",
        content: "This button shows all classifications",
        title: "Search by Classification"
    },
    {
        element: "#browseByTopic",
        content: "This button shows all topics",
        title: "Search by Topic"
    },
    {
        element: "#search_by_classification_NLM",
        title: "Search by Organization",
        content: "This button shows search result of NLM",
        placement: "left",
        onNext: tour => {
            let idClick = "search_by_classification_NLM";
            let idCheck = "resultList";
            let stepGoto = 9;
            tour.end();
            document.getElementById(idClick).click();
            TourService.waitForEltId(idCheck, () => TourService.takeATour(stepGoto));
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
        onNext: function (tour) {
            let idClick = "linkToElt_0";
            let idCheck = "addToQuickBoard";
            let stepGoto = 14;
            tour.end();
            document.getElementById(idClick).click();
            TourService.waitForEltId(idCheck, () => TourService.takeATour(stepGoto));
        }
    }
];

const btnSteps: Array<any> = [
    {
        element: "#addToQuickBoard",
        title: "Add To Quick Board",
        content: "This button allow users to add this element to quick board.",
        placement: "bottom"
    },
    {
        element: "#addToBoard",
        title: "Add To Board",
        content: "This button allow users to add this element to user's board.",
        placement: "bottom"
    },
    {
        element: "#export",
        title: "Export",
        content: "This button allow users to export this element to varies format.",
        placement: "bottom"
    }
];

const cdeSteps: Array<any> = [
    {
        element: "#general_tab",
        title: "General Details",
        content: "This section shows an overview of the CDE attributes.",
        placement: "bottom"
    },
    {
        element: "#pvs_tab",
        title: "Permissible Values",
        content: "Click here to see what type of value are allowed by this CDE.",
        placement: "bottom"
    },
    {
        element: "#naming_tab",
        title: "Names",
        content: "Any CDE may have multiple names, often given within a particular context.",
        placement: "bottom"
    },
    {
        element: "#classification_tab",
        title: "Classifications",
        content: "Classifications describe the way in which an organization may use a CDE. Any CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it.",
        placement: "bottom"
    },
    {
        element: "#concepts_tab",
        title: "Concepts",
        content: "Data Elements are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC.",
        placement: "bottom"
    },
    {
        element: "#referenceDocument_tab",
        title: "Reference Document",
        content: "This section contains reference documents for the CDE.",
        placement: "bottom"
    },
    {
        element: "#properties_tab",
        title: "Properties",
        content: "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process.",
        placement: "bottom"
    },
    {
        element: "#ids_tab",
        title: "Identifiers",
        content: "CDE may be identified multiple times across CDE users. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here.",
        placement: "bottom"
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
        title: "Sources",
        content: "This section shows the where this CDE load from.",
        placement: "bottom"
    },
    {
        element: "#registrationStateDiv",
        title: "Status",
        content: "This section shows the status of the CDE, and optionally dates and/or administrative status.",
        placement: "bottom"
    },
    {
        element: "#openLinkedBoardsModalBtn",
        title: "Boards",
        content: "If a CDE is used in a public board, the board will be shown in this section.",
        placement: "bottom"
    },
    {
        element: "#mltButton",
        title: "More Like This",
        content: "This section lists CDEs that are most similar to the CDE currently viewed.",
        placement: "bottom"
    },
    {
        element: "#openLinkedFormsModalBtn",
        title: "Forms",
        content: "If an element is used in a Form, it will be displayed here. ",
        placement: "bottom"
    },
    {
        element: "#openDataSetModalBtn",
        title: "Data Sets",
        content: "This section lists all data sets this CDE has.",
        placement: "bottom",
        onNext: function (tour) {
            let idClick1 = "openLinkedFormsModalBtn";
            let idClick2 = "linkToElt_0";
            let idClick3 = "closeLinkedFormsModalBtn";
            let idCheck = "description_tab";
            let stepGoto = 35;
            tour.end();
            document.getElementById(idClick1).click();
            console.log("clicked: " + idClick1);
            TourService.waitForEltId(idClick2, () => {
                document.getElementById(idClick2).click();
                console.log("clicked: " + idClick2);
                TourService.waitForEltId(idClick3, () => {
                    document.getElementById(idClick3).click();
                    console.log("clicked: " + idClick3);
                    TourService.waitForEltId(idCheck, () => TourService.takeATour(stepGoto));
                })
            });
        }
    }
];

const formSteps = [
    {
        element: "#description_tab",
        title: "Form Element",
        content: "If the form use questions, they will be here.",
        placement: "bottom"
    }
];

@Injectable()
export class TourService {

    static waitForEltId(eltId: string, cb) {
        let checkExist = setInterval(() => {
            if (document.getElementById(eltId)) {
                clearInterval(checkExist);
                cb();
            }
        }, 100);
    }

    static takeATour(from: number = 0) {
        let steps = navigationSteps.concat(searchResultSteps).concat(btnSteps).concat(cdeSteps).concat(formSteps);
        steps.splice(0, from);
        let tour = new Tour({
            name: "CDE-Tour",
            storage: false,
            steps: steps
        });
        tour.init();
        tour.start();
    }

}


