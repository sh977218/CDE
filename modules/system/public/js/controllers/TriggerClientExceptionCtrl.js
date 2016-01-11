angular.module('systemModule').controller('TriggerClientExceptionCtrl', ['$scope', function($scope) {
    for (var i = 0; i < 20; i++)
        trigger.error();
}]);