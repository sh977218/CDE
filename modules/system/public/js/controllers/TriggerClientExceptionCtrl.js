angular.module('systemModule').controller('TriggerClientExceptionCtrl', ['$scope', function($scope) {
    trigger.error();
}]);