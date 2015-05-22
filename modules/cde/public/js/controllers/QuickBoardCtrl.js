angular.module('cdeModule').controller('QuickBoardCtrl', ['$scope', 'CdeList', 'OrgHelpers', 'userResource', function($scope, CdeList, OrgHelpers, userResource) {

    $scope.cdes = [];
    $scope.qbGridCdes = [];
    
    $scope.removeDE = function( index ) {
        $scope.cdes.splice(index, 1);
        $scope.quickBoard.splice(index, 1);
    };
    
    $scope.emptyQuickBoardAndScreen = function() {
        $scope.emptyQuickBoard();
        $scope.cdes = [];
        $scope.qbGridCdes = [];
    };

    if ($scope.quickBoard.length > 0) {
        CdeList.byTinyIdList($scope.quickBoard, function(result) {
           if(result) {
                $scope.cdes = [];
                for (var i = 0; i < $scope.quickBoard.length; i++) {
                   for (var j = 0; j < result.length; j++) {
                       if ($scope.quickBoard[i] === result[j].tinyId) {
                           $scope.cdes.push(result[j]);
                       }
                   }
                }
               $scope.openCloseAll($scope.cdes, "quickboard");
               $scope.cdes.forEach(function(elt) {elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);});
           }
        });
    }

}]);