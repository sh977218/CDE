function SectionCtrl($scope, $modal) {

    $scope.cardinalityOptions = 
    {
        "1": "Exactly 1"
        , "+": "1 or more"
        , "*": "0 or more"
        , "0.1": "0 or 1"
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
            if (!$scope.form.formElements) {
                $scope.form.formElements = [];
            }
            $scope.form.formElements.push(newSection);
            $scope.stageElt();
        });
    };

    $scope.removeElt = function(index) {
        $scope.form.formElements.splice(index, 1);
        $scope.stageElt();
    };

    $scope.moveElt = function(index, inc) {
        $scope.form.formElements.splice(index + inc, 0, $scope.form.formElements.splice(index, 1)[0]);   
        $scope.stageElt();
    };

}