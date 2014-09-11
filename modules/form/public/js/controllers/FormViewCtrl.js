function FormViewCtrl($scope, $routeParams, Form, isAllowedModel) {
    $scope.module = "form";
    $scope.addCdeMode = false;
    $scope.openCdeInNewTab = true;
    $scope.dragEnabled = true;
    
    var route = $routeParams;
    
    if (route._id) var query = {formId: route._id, type: '_id'};
    if (route.tinyId) var query = {formId: route.tinyId, type: 'tinyId'};

    $scope.reload = function() {
        Form.get(query, function (form) {
            $scope.elt = form;
            isAllowedModel.setCanCurate($scope);
            isAllowedModel.setDisplayStatusWarning($scope);
            isAllowedModel.setCanDoNonCuration($scope);
        });        
    };
    
    $scope.reload();
    
    $scope.switchEditQuestionsMode = function() {
        $scope.addCdeMode = !$scope.addCdeMode;
    };
    
    $scope.revert = function() {
        $scope.reload();
    };

    $scope.stageElt = function() {
        $scope.elt.unsaved = true;
    };    
    
    $scope.classificationToFilter = function() {
         if ($scope.elt != null) {
             return $scope.elt.classification;
         } 
    };      
}