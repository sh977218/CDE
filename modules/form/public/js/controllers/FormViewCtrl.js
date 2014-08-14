function FormViewCtrl($scope, $routeParams, Form) {
    var route = $routeParams;
    $scope.initialized = false;
    
    if (route._id) var query = {formId: route._id, type: '_id'};
    if (route.uuid) var query = {formId: route.uuid, type: 'uuid'};
    Form.get(query, function (form) {
        $scope.form = form;
        $scope.initialized = true;        
    });

    
}