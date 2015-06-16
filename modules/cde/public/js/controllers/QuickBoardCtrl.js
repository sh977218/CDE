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

    QuickBoard.loadElts();

}]);