function SectionCtrl($scope, $modal) {

    $scope.cardinalityOptions = 
    {
        "1": "Exactly 1"
        , "+": "1 or more"
        , "*": "0 or more"
        , "0.1": "0 or 1"
    };

    $scope.addSection = function() {
        if (!$scope.form.formElements) {
            $scope.form.formElements = [];
        }
        $scope.form.formElements.push({label: "New Section", cardinality: "1", section: {}});
        $scope.stageElt(); 
    };

    $scope.openAddQuestion = function(formElement) {
        var modalInstance = $modal.open({
          templateUrl: '/form/public/html/addQuestion.html',
          controller: AddQuestionModalCtrl,
          size: 'sm', 
          resolve: {
                cardinalityOptions: function() {
                  return $scope.cardinalityOptions;
                }         
          }
        });

        modalInstance.result.then(function (newQuestion) {
            if (!formElement.formElements) {
                formElement.formElements = [];
            }
            formElement.formElements.push(newQuestion);
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