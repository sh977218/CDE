function SectionCtrl($scope, $modal) {

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

    $scope.removeSection = function(index) {
        $scope.form.sections.splice(index, 1);
        $scope.form.unsaved = true;
    };

    $scope.moveSection = function(index, inc) {
        $scope.form.sections.splice(index + inc, 0, $scope.form.sections.splice(index, 1)[0]);    
        $scope.form.unsaved = true;
    };
    
}