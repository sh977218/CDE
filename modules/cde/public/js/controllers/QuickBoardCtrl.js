angular.module('cdeModule').controller('QuickBoardCtrl',
    ['$scope', 'CdeList', 'OrgHelpers', 'userResource', 'QuickBoard',
        function($scope, CdeList, OrgHelpers, userResource, QuickBoard) {

    $scope.getQuickBoardElts = function() {
        return QuickBoard.elts;
    };

    $scope.removeElt = function(index) {
        QuickBoard.remove(index);
    };
    
    $scope.emptyQuickBoard = function() {
        QuickBoard.empty();
    };

    //if ($scope.quickBoard.length > 0) {
    //    CdeList.byTinyIdList($scope.quickBoard, function(result) {
    //       if(result) {
    //            $scope.cdes = [];
    //            for (var i = 0; i < $scope.quickBoard.length; i++) {
    //               for (var j = 0; j < result.length; j++) {
    //                   if ($scope.quickBoard[i] === result[j].tinyId) {
    //                       $scope.cdes.push(result[j]);
    //                   }
    //               }
    //            }
    //           $scope.openCloseAll($scope.cdes, "quickboard");
    //           $scope.cdes.forEach(function(elt) {elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);});
    //       }
    //    });
    //}

}]);