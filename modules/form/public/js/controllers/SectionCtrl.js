function SectionCtrl($scope, $modal) {

    $scope.cardinalityOptions = 
    {
        "1": "Exactly 1"
        , "+": "1 or more"
        , "*": "0 or more"
        , "?": "0 or 1"
    };

    $scope.openAddSection = function() {
        var modalInstance = $modal.open({
          templateUrl: '/form/public/html/addSection.html',
          controller: AddSectionModalCtrl,
          resolve: {
                cardinalityOptions: function() {
                  return $scope.cardinalityOptions;
                }         
          }
        });

        modalInstance.result.then(function (newSection) {
            if (!$scope.form.sections) {
                $scope.form.sections = [];
            }
            $scope.form.sections.push(newSection);
            $scope.stageElt();
        });
    };

    $scope.removeSection = function(index) {
        $scope.form.sections.splice(index, 1);
        $scope.stageElt();
    };

    $scope.moveSection = function(index, inc) {
        $scope.form.sections.splice(index + inc, 0, $scope.form.sections.splice(index, 1)[0]);   
        $scope.stageElt();
    };

}