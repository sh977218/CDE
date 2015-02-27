angular.module('cdeModule').controller('DEListCtrl', ['$scope', '$controller', 'TourContent', function($scope, $controller, TourContent) {
    $scope.module = "cde";         
    $scope.dragSortableOptions = {
        connectWith: ".dragQuestions"
        , handle: ".fa.fa-arrows"
        , helper: "clone"
        , appendTo: "body"
    };
    $controller('ListCtrl', {$scope: $scope}); 

    TourContent.steps = [     
        {
            element: "#dropdownMenu_help"
            , title: "Welcome"
            , content: "Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here. Different sections of the applications have different help sections."
        }
        , {
              element: "a:contains('CDEs')"
              , title: "CDEs"
              , content: "This menu will take you back to the CDE search page"
          }
        , {
              element: "a:contains('Forms')"
              , title: "Forms"
              , content: "This menu will take you to the Form search page"
          }
        , {
              element: "#boardsMenu"
              , title: "Boards"
              , content: "Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them."
          }
        , {
              element: "a:contains('Quick Board (')"
              , title: "Quick Board"
              , content: "The quick board is is a volatile board for doing quick comparisons or CDE downloads. The quick board is emptied when the page is refreshed."
          }
        , {
              element: "a:contains('Help')"
              , title: "Help"
              , content: "Here's where you can find more documentation about this site or start this tour again."
          }      
          , {
              element: "#ftsearch-input"
              , title: "Search"
              , placement: "bottom"
              , content: "Enter one or more search terms. For example, search for \"Ethnicity\"."
          }
          , {
              element: "#accordionList"
              , title: "Search result"
              , placement: "top"
              , content: "This is your search result. It will show a combination of most relevant and higher status CDEs first."
          }
          , {
              element: "#acc_link_0"
              , title: "CDE summary"
              , content: "Click the accordion to view the CDE summary"
          }
          , {
              element: "#openEltInCurrentTab_0"
              , title: "CDE Detail"
              , content: "This button will take you to the full detail of this CDE."
          }
          , {
              element: ".fa-eye:first"
              , title: "View full detail"
              , content: "Click the eye to see the full detail of this data element"
          }
          , {
              element: "#addToCompare_0"
              , title: "Add to Quick Board"
              , content: "The plus sign will add a CDE to your Quick Board."
          }
          , {
              element: "#gridView"
              , placement: "left"
              , title: "Grid View"
              , content: "The grid view shows all search results (max 1000) in a single page. From there, results can be downloaded in CSV format. "
          }
          , {
              element: "#showHideFilters"
              , placement: "left"
              , title: "Filters"
              , content: "If your screen is small and the filters on the left end bother you, you can hide them here."
          }        
          , {
           element: "#classif_filter_title"
           , title: "Classifications"
           , content: "Navigate the classification tree to filter results by context, domain, or other type of data element classification or grouping."
          },
          {
              element: "#altClassificationFilterModeToggle"
              , title: "Classifications"
              , content: "You can add a second classification restriction by clicking this plus sign."
          },
          {
            element: "#classif_filter",
            title: "Filters",
            content: "See which filter are applied to your query"      
          },
          {
            element: "#status_filter",
            title: "Status",
            content: "Restrict search to one or more statuses here. "      
          }
          , {
            element: "#status-text-Recorded",
            title: "Recorded Status",
            content: "By default, CDEs in Recorded status are hidden. You can enable this checkbox to make them appear. "      
          }
    ];
    
    $scope.$on("$destroy", function handler() {
        TourContent.stop();
    });    
    
}
]);