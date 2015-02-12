function TriggerClientExceptionCtrl($scope) {
    //trigger.error();
    
    $scope.evaluateByTemplate = function(){
        trigger.error();
        return true;
    };
}