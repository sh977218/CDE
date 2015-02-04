function TakeATourCtrl($scope, TourContent) {  
    

    $scope.setTour = function () {
        $scope.tour = new Tour({steps: TourContent.steps});
        $scope.tour.init();
        $scope.tour.restart();    
    };

    $scope.restartTour = function() {
        $scope.setTour();
    };
    

}
