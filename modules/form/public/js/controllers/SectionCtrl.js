function SectionCtrl($scope, $modal, $timeout, $http) {
        
    $scope.cardinalityOptions = 
    {
        "1": "Exactly 1"
        , "+": "1 or more"
        , "*": "0 or more"
        , "0.1": "0 or 1"
    };
    
    $scope.addSection = function() {
        if (!$scope.elt.formElements) {
            $scope.elt.formElements = [];
        }
        $scope.elt.formElements.push({label: "New Section", cardinality: "1", section: {}, formElements: [], elementType: "section"});
        $scope.stageElt(); 
    };
    
    $scope.sortableOptionsSections = {
        connectWith: ".dragQuestions"
        , handle: ".fa.fa-arrows"
    };        

    $scope.sortableOptions = {
        connectWith: ".dragQuestions"
        , handle: ".fa.fa-arrows"
        , receive: function(e, ui) {
            var cde = ui.item.sortable.moved;
            if (cde.valueDomain !== undefined) {
                var question = {
                    elementType: "question"
                    , label: cde.naming[0].designation
                    , cardinality: "1"
                    , question: {
                        cde: {tinyId: cde.tinyId
                            , version: cde.version
                            }
                        , datatype: cde.valueDomain.datatype
                        , required: false
                        , uoms: []
                    }
                };
                if (cde.valueDomain.uom) {
                    question.question.uoms.push(cde.valueDomain.uom);
                }
                question.question.answers = [];
                question.question.cde.permissibleValues = [];
                if (cde.valueDomain.permissibleValues.length > 0) {
                    if (cde.valueDomain.permissibleValues.length > 9) {
                        $http.get("debytinyid/" + cde.tinyId + "/" + cde.version).then(function (result) {
                            result.data.valueDomain.permissibleValues.forEach(function(pv) {
                                question.question.answers.push(pv); 
                                question.question.cde.permissibleValues .push(pv);  
                            });
                        });
                    } else {
                        cde.valueDomain.permissibleValues.forEach(function(pv) {
                            question.question.answers.push(pv); 
                            question.question.cde.permissibleValues.push(pv);
                        });
                    }
                }
                ui.item.sortable.moved = question;
            }
            $scope.stageElt();
        }
    };

    $scope.openNameSelect = function(question) {
        var modalInstance = $modal.open({
          templateUrl: '/form/public/html/selectQuestionName.html',
          controller: SelectQuestionNameModalCtrl,
          resolve: {
                cde: function() {
                  return question.question.cde;
                }         
          }
        });

        modalInstance.result.then(function (selectedName) {
            question.label = selectedName;
            $scope.stageElt();
        });
    };
    
    $scope.checkUom = function(question, index) {
        $timeout(function() {
            if (question.question.uoms[index] === "") question.question.uoms.splice(index, 1);        
        }, 0);
    };

    $scope.canAddUom = function(question) {
        return $scope.canCurate && (question.question.uoms.indexOf("Please specify") < 0);
    };
    
    $scope.addUom = function(question) {
        question.question.uoms.push("Please specify");
    };

    $scope.removeElt = function(form, index) {
        form.formElements.splice(index, 1);
        $scope.stageElt();
        
        if(form.formElements.length === 0) {
            $scope.setToNoneAddCdeMode();
        }
    };
    
    $scope.removeQuestion = function(section, index) {
        section.formElements.splice(index, 1);
        $scope.stageElt();
    };

    $scope.moveElt = function(index, inc) {
        $scope.elt.formElements.splice(index + inc, 0, $scope.elt.formElements.splice(index, 1)[0]);   
        $scope.stageElt();
    };

}