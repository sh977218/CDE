angular.module('systemModule').controller('TakeATourCtrl', ['$scope', 'TourContent', function ($scope, TourContent) {

    TourContent.stop = function () {
        if ($scope.tour)
            $scope.tour.end();
    };

    $scope.setTour = function () {
        $scope.tour = new Tour({template: TourContent.template, steps: TourContent.steps});
        $scope.tour.init();
        $scope.tour.restart();
    };

    $scope.restartTour = function () {
        $scope.setTour();
    };


}
]);