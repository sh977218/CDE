angular.module('cdeModule').controller('MoreLikeThisCtrl',['$scope', '$http', '$location', '$log'
        , function($scope, $http, $location, $log)
{
    $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
        "/system/public/html/accordion/addToQuickBoardActions.html"];

    $scope.view = function(cde, event) {
        $scope.interruptEvent(event);
        $location.url("deview?tinyId=" + cde.tinyId);
    };   

    var loadMlt = function() {
        $http({method: "GET", url: "/moreLikeCde/" + $scope.elt.tinyId}).then(function onSuccess(response) {
            $scope.cdes = response.data.cdes;
        }).catch(function onError() {
            $log.error("Unable to retrieve MLT");
        });
    };

    $scope.$on('loadMlt', function() {
        loadMlt();
    });

    $scope.mltCtrlLoadedPromise.resolve();


}]);