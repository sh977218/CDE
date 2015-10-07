angular.module('cdeModule').controller('CdeDiffCtrl', ['$scope', 'CdeDiff', 'CdeDiffPopulate', 'PriorCdes',
    function ($scope, CdeDiff, CdeDiffPopulate, PriorCdes)
{

    $scope.viewDiff = function (elt) {
        CdeDiff.get({deId: elt._id}, function (diffResult) {
            diffResult = diffResult.filter(function (change) {
                return change.path[3] !== "isValid";
            });
            diffResult.forEach(CdeDiffPopulate.makeHumanReadable);
            $scope.cdeDiff = diffResult;
        });
    };

    $scope.nullsToBottom = CdeDiffPopulate.nullsToBottom;

    var loadPriorCdes = function() {
        if (!$scope.priorCdes) {
            if ($scope.elt.history && $scope.elt.history.length > 0) {
                PriorCdes.getCdes({cdeId: $scope.elt._id}, function (dataElements) {
                    $scope.priorCdes = dataElements;
                });
            }
        }
    };

    $scope.$on('loadPriorCdes', loadPriorCdes);

}]);