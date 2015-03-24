angular.module('cdeModule').controller('MoreLikeThisCtrl',['$scope', '$http', '$location'
        , function($scope, $http, $location) {


    $scope.view = function(cde, event) {
        $scope.interruptEvent(event);
        $location.url("deview?tinyId=" + cde.tinyId);
    };   

    $scope.cdes = [];

    var loadMlt = function() {
        $http({method: "GET", url: "/moreLikeCde/" + $scope.elt._id}).
             error(function(data, status) {
             }).
             success(function(data, status) {
                 $scope.cdes = data.cdes;
             })
        ;
    };

    $scope.cdeLoadedPromise.then(loadMlt);


}]);