function FormViewCtrl($scope, $routeParams, Form, $modal) {
    var route = $routeParams;
    $scope.initialized = false;
    
    if (route._id) var query = {formId: route._id, type: '_id'};
    if (route.uuid) var query = {formId: route.uuid, type: 'uuid'};

    $scope.reload = function() {
        Form.get(query, function (form) {
            $scope.form = form;
            $scope.initialized = true;        
        });        
    };
    
    $scope.reload();
    
    $scope.revert = function() {
        $scope.reload();
    };

    $scope.stageElt = function() {
        $scope.form.unsaved = true;
    };    
}