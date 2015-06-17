angular.module('cdeModule').controller('QuickBoardCtrl',
    ['$scope', 'CdeList', 'OrgHelpers', 'userResource', 'QuickBoard',
        function($scope, CdeList, OrgHelpers, userResource, QuickBoard) {

    $scope.cdes = [];
    $scope.quickBoard = QuickBoard;

    $scope.getQuickBoardElts = function() {
        return QuickBoard.elts;
    };

    $scope.removeElt = function(index) {
        QuickBoard.remove($scope.cdes[index]);
        $scope.cdes.splice(index, 1);
    };
    
    $scope.emptyQuickBoard = function() {
        QuickBoard.empty();
    };

    $scope.openCloseAll = function(cdes, type) {
        for (var i = 0; i < cdes.length; i++) {
            cdes[i].isOpen = $scope.openCloseAllModel[type];
        }
    };

    QuickBoard.loadElts(function() {
        // TODO REFAC this. cdeAccordionList excepts something called cdes.
        $scope.cdes = [];
        Object.keys(QuickBoard.elts).forEach(function(key) {
            $scope.cdes.push(QuickBoard.elts[key]);
        });
        $scope.openCloseAll($scope.cdes, "quickboard");
    });

}]);