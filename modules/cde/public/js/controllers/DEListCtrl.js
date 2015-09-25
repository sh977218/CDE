angular.module('cdeModule').controller('DEListCtrl', ['$scope', '$controller', 'TourContent', 'userResource', '$timeout',
    function ($scope, $controller, TourContent, userResource, $timeout) {
        $scope.module = "cde";

        userResource.getPromise().then(function () {
            $scope.search("cde");
        });
        $scope.dragSortableOptions = {
            connectWith: ".dragQuestions"
            , handle: ".fa.fa-arrows"
            , helper: "clone"
            , appendTo: "body"
            , revert: true
            , placeholder: "questionPlaceholder"
            , start: function (event, ui) {
                $('.dragQuestions').css('border', '2px dashed grey');
                ui.placeholder.height("20px");
            }
            , stop: function (event, ui) {
                $('.dragQuestions').css('border', '');
            }
            , helper: function () {
                return $('<div class="placeholderForDrop"><i class="fa fa-arrows"></i> Question</div>')
            }
        };

        TourContent.template = "<div class='popover tour'>" +
        "<div class='arrow'></div>" +
        "<h3 class='popover-title'></h3>" +
        "<div class='popover-content'></div>" +
        "<div class='popover-navigation'>" +
        "<div class='btn-group'>" +
        "<button class='btn btn-sm btn-default' tabindex='1' data-role='prev'>&laquo; Prev</button>" +
        "<button class='btn btn-sm btn-default' tabindex='1' data-role='next'>Next &raquo;</button>" +
        "</div>" +
        "<button class='btn btn-sm btn-default' tabindex='1' data-role='end'>End tour</button>" +
        "</div>" +
        "</div>";
        TourContent.steps = [
            {
                element: "#ftsearch-input"
                , title: "Search"
                , placement: "bottom"
                , content: "Enter one or more search terms. For example, search for \"Ethnicity\"."
            }
            , {
                element: "#accordionList"
                ,
                title: "Search result"
                ,
                placement: "top"
                ,
                content: "This is your search result. It will show a combination of most relevant and higher status CDEs first."
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
                ,
                placement: "left"
                ,
                title: "Grid View"
                ,
                content: "The grid view shows all search results (max 1000) in a single page. From there, results can be downloaded in CSV format. "
            }
            , {
                element: "#showHideFilters"
                , placement: "left"
                , title: "Filters"
                , content: "If your screen is small and the filters on the left end bother you, you can hide them here."
            }
            , {
                element: "#classif_filter_title"
                ,
                title: "Classifications"
                ,
                content: "Navigate the classification tree to filter results by context, domain, or other type of data element classification or grouping."
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
            }, {
                element: ".feedback-btn"
                , title: "Experiencing issues?"
                , content: "If you experience technical issues with the website you can report them here."
                , placement: "left"
            }
        ];

        $scope.$on("$destroy", function handler() {
            TourContent.stop();
        });


    }]);