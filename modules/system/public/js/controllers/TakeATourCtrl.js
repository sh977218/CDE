function TakeATourCtrl($scope, TourContent) {  
    
    TourContent.stop = function() {
        if ($scope.tour)
            $scope.tour.end();
    };

    $scope.setTour = function () {       
        $scope.tour = new Tour({steps: TourContent.steps});
        $scope.tour.init();
        $scope.tour.restart();    
    };

    $scope.restartTour = function() {
        $scope.setTour();
    };
    

}
