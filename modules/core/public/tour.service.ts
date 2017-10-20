import { Injectable } from "@angular/core";
import * as Tour from "../../../node_modules/bootstrap-tour/build/js/bootstrap-tour-standalone.js";
import * as _ from "lodash";

@Injectable()
export class TourService {
    static router;
    static navigationSteps: Array<any> = [
        {
            title: "Welcome",
            content: "Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here.",
            orphan: true
        },
        {
            element: "#menu_cdes_link",
            title: "CDEs",
            content: "Click here to start browsing CDEs"
        },
        {
            element: "#menu_forms_link",
            title: "Forms",
            content: "Or here to browse forms"
        },
        {
            element: "#boardsMenu",
            title: "Boards",
            content: "Boards allow registered users to group CDEs or Forms. Boards can be private or public. Boards are persistent and will not disappear unless you remove them."
        },
        {
            element: "#menu_qb_link",
            title: "Quick Board",
            content: "The quick board is a volatile board that can be used for temporarily storing CDEs and forms. You can also use the quick board to compare CDEs and Forms."
        },
        {
            element: "#menu_help_link",
            title: "Help",
            content: "You can find more help about the site here, or information on our APIs. The tour will now take you to the CDE search page.",
            onNext: tour => TourService.router.navigate(["/cde/search"])
        },
        {
            element: "#browseByClassification",
            content: "CDEs or Forms can be browsed by Classifications. Classifications are ways for content owners to organize their CDEs.",
            title: "Browse by Classification"
        },
        {
            element: "#browseByTopic",
            content: "Or by topic. Topics are MeSH terms.",
            title: "Browse by Topic"
        },
        {
            element: "#search_by_classification_NLM",
            title: "Browse by Organization",
            content: "These boxes represent classifications. Clicking NLM will browse all CDEs classified by NLM.",
            placement: "left",
            onNext: tour => TourService.router.navigate(["resultList"])
        },
        {
            element: "#resultList",
            title: "Search Result",
            content: "Browsing can return hundreds of elements, sorted by their registration and usage. When elements have list of values, the search summary shows a subset of those values. ",
            placement: "top"
        },
        {
            element: "#classif_filter_title",
            content: "We can continue browsing inside the NLM classification here. ",
            title: "Classification Filter",
            placement: "top"
        },
        {
            element: "#status_filter",
            content: "By default, only Qualified and above statuses will be returned. This can be changed in your preferences (the wheel in the upper right corner).",
            title: "Registration Status"
        },
        {
            element: "#datatype_filter",
            content: "Finally, we can narrow our results down by datatype. For example, only see CDEs that represent a number.",
            title: "Data Types"
        }, {
            element: "#linkToElt_0",
            content: "The tour will now take us to an individual record by clicking its name.",
            title: "Search Result",
            onNext: tour => TourService.router.navigate(["addToQuickBoard"])
        },
        {
            element: "#general_tab",
            title: "General Details",
            content: "This section shows an overview of the CDE attributes.",
            placement: "bottom"
        },
        {
            element: "#dd_updated",
            title: "Dates",
            content: "CDEs may have a date when they were last imported. If they were updated during that import, updated will show that date. Manual changes also show under updated. Created shows the date that the CDE was created in the NLM repository. If they were created or updated in a external repository, this information will show under Source.",
            placement: "bottom"
        },
        {
            element: "#sources_0",
            title: "Sources",
            content: "Many elements were imported from external sources. This section can give useful details about the source, such as copyright, status or created date.",
            placement: "bottom"
        },
        {
            element: "#registrationStateDiv",
            title: "Status",
            content: "The registration status represents the maturity level of an element, with Standard and Preferred Standard being highest. Only qualified and above are retrieved in search results by default. When elements are first created, they get an incomplete status.",
            placement: "bottom"
        },
        {
            element: "#pvs_tab",
            title: "Permissible Values",
            content: "This tab will tell us if a CDE is based on a number, text, value list or other datatype.",
            placement: "top"
        },
        {
            element: "#naming_tab",
            title: "Names",
            content: "Any CDE may have multiple names. Names help identify the CDE and are also used as question labels on forms. A name can have one or more tags to describe the context of this name.",
            placement: "top"
        },
        {
            element: "#classification_tab",
            title: "Classifications",
            content: "Classifications describe the way in which an organization may use a CDE or Form. A CDE can have hundreds of classification. Classifications are defined by steward. A steward may decide to reuse a CDE by adding his own classification to it.",
            placement: "top"
        },
        {
            element: "#concepts_tab",
            title: "Concepts",
            content: "CDEs are sometimes described by one or more concepts. These concepts can come from any terminology, for example LOINC.",
            placement: "top"
        },
        {
            element: "#referenceDocument_tab",
            title: "Reference Document",
            content: "This section contains reference documents for the CDE.",
            placement: "top"
        },
        {
            element: "#properties_tab",
            title: "Properties",
            content: "This sections show attributes of the CDE that are not common across CDEs. Steward may choose to store properties that are required for their process.",
            placement: "top"
        },
        {
            element: "#ids_tab",
            title: "Identifiers",
            content: "CDEs and Forms can be identified using multiple identification sources. When a group uses a CDE by a particular unique (scoped) identifier, it may be stored here.",
            placement: "top"
        },
        {
            element: "#attachments_tab",
            title: "Attachments",
            content: "If a file is attached to a CDE, it can be viewed or downloaded here.",
            placement: "top"
        },
        {
            element: "#history_tab",
            title: "History",
            content: "This section shows all prior states of the CDE. Each version can be view as it was at a given date. In addition, differences between versions can be highlighted to easily identify changes over time.",
            placement: "top"
        },
        {
            element: "#derivationRules_tab",
            title: "Derivation Rules",
            content: "Derivation Rules are used to connect CDEs together, for example, in the form of a score.",
            placement: "top"
        },
        {
            element: "#validRules_tab",
            title: "Validation Rules",
            content: "Validation Rules are used to validate CDE. ",
            placement: "top"
        },
        {
            element: "#export",
            title: "Export",
            content: "CDEs can be exported in JSON or XML Format.",
            placement: "bottom"
        },
        {
            element: "#discussBtn",
            title: "Discuss",
            content: "With an account, anyone can interactively discuss an element. Users can reply to comment or resolve them.",
            placement: "bottom"
        },
        {
            element: "#openLinkedBoardsModalBtn",
            title: "Boards",
            content: "If a CDE is used in public boards, the boards will be shown in this section.",
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
            content: "If a CDE is used in Forms, they will be displayed here. ",
            placement: "bottom"
        },
        {
            element: "#openDataSetModalBtn",
            title: "Data Sets",
            content: "CDEs may be used in research. If datasets are public, they can be found here.",
            placement: "bottom"
        },
        {
            element: "#menu_forms_link",
            title: "Forms",
            content: "We will now continue the tour and show Form features.",
            placement: "bottom",
        },
        {
            element: "#browseByClassification",
            content: "Forms are also browsed by Classification",
            title: "Browse by Classification"
        },
        {
            element: "#resultList",
            title: "Search Result",
            content: "We will now go into a form.",
            placement: "top"
        },
        {
            element: "#general_tab",
            title: "General Details",
            content: "Forms have similar administrative details to CDE. When rendering is allowed, a preview of the form will display in this tab. There are multiple form rending types including: skip logic, printable forms, tables, and hidden questions. More detail about these features can be found on the Display Profiles tab.",
            placement: "top"
        },
        {
            element: "#description_tab",
            title: "Form Element",
            content: "The repository may not have permission to display all forms. If it does details of form questions and sections are displayed in this tab. Form support logic, selecting possible answer values, scores, repeating questions and many more features. ",
            placement: "bottom"
        },
        {
            element: "#export",
            title: "Export",
            content: "Forms can be exported when users are logged in. Available formats are JSON, XML, ODM, SDC and RedCAP.",
            placement: "bottom"
        },
        {
            element: "#login_link",
            title: "Thank you",
            content: "Thank you for taking this tour. Consider creating a free UMLS account to get access to the full suite of features this repository has to offer.",
            placement: "bottom"
        }
    ];

    static steps = TourService.navigationSteps;
    static currentSteps = _.cloneDeep(TourService.steps);

    static takeATour(from: number = 0) {
        let tour = new Tour({
            name: "CDE-Tour",
            storage: false,
            steps: TourService.currentSteps
        });
        tour.init();
        tour.start();
    }

    static newTour(r) {
        this.router = r;
        TourService.currentSteps = _.cloneDeep(TourService.steps);
        TourService.takeATour();
    }

}


