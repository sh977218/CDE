import {upgradeAdapter} from "../../../../upgrade.ts";
import {IdentifiersComponent} from "../../components/adminItem/identifiers.component";

angular.module('systemModule').directive('cdeAdminItemIds', upgradeAdapter.downgradeNg2Component(IdentifiersComponent));


//angular.module('systemModule').controller('NewIdModalCtrl', ['$scope', '$uibModalInstance', 'elt',
//    function($scope, $modalInstance, elt) {
//
//    $scope.elt = elt;
//    $scope.newId = {};
//
//    $scope.okCreate = function () {
//        $modalInstance.close($scope.newId);
//    };
//
//    $scope.cancelCreate = function() {
//        $modalInstance.dismiss("Cancel");
//    };
//}]);
