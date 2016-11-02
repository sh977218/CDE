angular.module('cdeModule').controller('DEListCtrl',
    ['$scope', '$controller', '$http', '$uibModal', 'TourContent', 'userResource', '$timeout', 'QuickBoard',
    function ($scope, $controller, $http, $modal, TourContent, userResource, $timeout, QuickBoard) {
        $scope.module = "cde";
        $scope.quickBoard = QuickBoard;

        $scope.exporters.csv = {id: "csvExport", display: "CSV Export"};

        $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
            "/cde/public/html/accordion/addToQuickBoardActions.html"];

        $timeout(function () {
            $scope.search("cde");
        }, 0);

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

        $scope.$on("$destroy", function handler() {
            TourContent.stop();
        });

        $scope.openPinModal = function (cde) {
            if (userResource.user.username) {
                var modalInstance = $modal.open({
                    animation: false,
                    templateUrl: '/system/public/html/selectBoardModal.html',
                    controller: 'SelectCdeBoardModalCtrl'
                });

                modalInstance.result.then(function (selectedBoard) {
                    $http.put("/pin/cde/" + cde.tinyId + "/" + selectedBoard._id).then(function (response) {
                        if (response.status === 200) {
                            $scope.addAlert("success", response.data);
                        } else
                            $scope.addAlert("warning", response.data);
                    }, function (response) {
                        $scope.addAlert("danger", response.data);
                    });
                }, function () {
                });
            } else {
                $modal.open({
                    animation: false,
                    templateUrl: '/system/public/html/ifYouLogInModal.html'
                });
            }
        };
    }]);