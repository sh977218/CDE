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
    
    $scope.openAddSection = function() {
        var modalInstance = $modal.open({
          templateUrl: '/form/public/html/addSection.html',
          controller: AddSectionModalCtrl,
          resolve: {
          }
        });

        modalInstance.result.then(function (newSection) {
            if (!$scope.form.sections) {
                $scope.form.sections = [];
            }
            $scope.form.sections.push(newSection);
            $scope.form.unsaved = true;
        });
    };

    $scope.revert = function() {
        $scope.reload();
    };

    
}