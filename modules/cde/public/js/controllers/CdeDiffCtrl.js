angular.module('cdeModule').controller('CdeDiffCtrl', ['$scope', 'CdeDiff', 'CdeDiffPopulate', function($scope, CdeDiff, CdeDiffPopulate) {        
    $scope.viewDiff = function (elt) {        
        CdeDiff.get({deId: elt._id}, function(diffResult) {
            diffResult = diffResult.filter(function(change) {
                return change.path[3] !== "isValid";
            });
            diffResult.forEach(CdeDiffPopulate.makeHumanReadable);
            $scope.cdeDiff = diffResult;
        });
    };      
    
    $scope.nullsToBottom = CdeDiffPopulate.nullsToBottom;
}]);