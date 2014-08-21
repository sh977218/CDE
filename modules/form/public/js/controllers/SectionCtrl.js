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

    $scope.sortableOptions = {
        receive: function(e, ui) {
            var cde = ui.item.sortable.moved;
            ui.item.sortable.moved = {
                label: cde.naming[0].designation
                , cardinality: "1"
                , cde: {uuid: cde.uuid, version: cde.version}
                , datatype: cde.valueDomain.datatype
            };
            $scope.stageElt();
        }
    };

    $scope.openAddQuestion = function(formElement) {
        var modalInstance = $modal.open({
          templateUrl: '/form/public/html/addQuestion.html',
          controller: AddQuestionModalCtrl,
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

    $scope.openNameSelect = function(question) {
        var modalInstance = $modal.open({
          templateUrl: '/form/public/html/selectQuestionName.html',
          controller: SelectQuestionNameModalCtrl,
          resolve: {
                cde: function() {
                  return question.cde;
                }         
          }
        });

        modalInstance.result.then(function (selectedName) {
            question.label = selectedName;
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