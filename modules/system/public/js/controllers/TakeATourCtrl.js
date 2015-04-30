angular.module('systemModule').controller('TakeATourCtrl', ['$scope', 'TourContent',
    function ($scope, TourContent) {

        var defaultSteps =  [
            {
                element: "#dropdownMenu_help"
                , title: "Welcome"
                , content: "Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here. Different sections of the applications have different help sections."
            }
            , {
                element: "a#menu_cdes_link"
                , title: "CDEs"
                , content: "This menu will take you back to the CDE search page"
            }
            , {
                element: "a#menu_forms_link"
                , title: "Forms"
                , content: "This menu will take you to the Form search page"
            }
            , {
                element: "#boardsMenu"
                ,
                title: "Boards"
                ,
                content: "Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them."
            }
            , {
                element: "#boardsLink"
                ,
                title: "Boards"
                ,
                content: "Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them."
            }
            , {
                element: "a:contains('Quick Board (')"
                ,
                title: "Quick Board"
                ,
                content: "The quick board is is a volatile board for doing quick comparisons or CDE downloads. The quick board is emptied when the page is refreshed."
            }
            , {
                element: "a:contains('Help')"
                , title: "Help"
                , content: "Here's where you can find more documentation about this site or start this tour again."
            }];

    TourContent.stop = function () {
        if ($scope.tour)
            $scope.tour.end();
    };

    $scope.setTour = function () {

        $scope.tour = new Tour({template: TourContent.template,
            steps:  defaultSteps.concat(TourContent.steps)});
        $scope.tour.init();
        $scope.tour.restart();
    };

    $scope.restartTour = function () {
        $scope.setTour();
    };


}
]);