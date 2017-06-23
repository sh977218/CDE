let steps = [
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
    },
    {
        element: "#dropdownMenu_help",
        title: "Welcome",
        content: "Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here. Different sections of the applications have different help sections."
    },
    {
        element: "#searchSettings",
        title: "Preferences",
        content: "Personalize your search results. Include more registration statuses or configure how results are shown.",
        placement: "left"
    }
];

let step1 = [
    {
        element: "#ftsearch-input",
        title: "Search",
        placement: "bottom",
        content: "Enter one or more search terms. For example, search for \"Ethnicity\"."
    },
    {
        element: "#resultList",
        title: "Search result",
        placement: "top",
        content: "This is your search result. It will show a combination of most relevant and higher status CDEs first."
    },
    {
        element: "#acc_link_0", title: "CDE summary", content: "Click the accordion to view the CDE summary"
    },
    {
        element: "#addToCompare_0",
        title: "Add to Quick Board",
        content: "The plus sign will add a CDE to your Quick Board."
    },
    {
        element: "#cde_gridView", placement: "left", title: "Grid View",
        content: "The grid view shows all search results (max 1000) in a single page. From there, results can be downloaded in CSV format. "
    },
    {
        element: "#showHideFilters",
        placement: "left",
        title: "Filters",
        content: "If your screen is small and the filters on the left end bother you, you can hide them here."
    },
    {
        element: "#classif_filter_title",
        title: "Classifications",
        content: "Navigate the classification tree to filter results by context, domain, or other type of data element classification or grouping."
    },
    {
        element: "#altClassificationFilterModeToggle",
        title: "Classifications",
        content: "You can add a second classification restriction by clicking this plus sign."
    },
    {
        element: "#classif_filter", title: "Filters", content: "See which filter are applied to your query"
    },
    {
        element: "#status_filter",
        title: "Status",
        content: "Restrict search to one or more statuses here. "
    },
    {
        element: ".feedback-btn",
        title: "Experiencing issues?",
        content: "If you experience technical issues with the website you can report them here.",
        placement: "left"
    }
];
