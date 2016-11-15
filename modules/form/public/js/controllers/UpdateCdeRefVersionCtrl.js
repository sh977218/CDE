angular.module('cdeModule').controller('UpdateCdeRefVersionCtrl', ['$scope', '$http', 'currentQuestion', 'newQuestion',
    function ($scope, $http, currentQuestion, newQuestion) {
        $scope.emptyStringToNull = function (convert) {
            if (convert === '')
                return null;
            else
                return convert;
        };
        $http.get("/debytinyid/" + newQuestion.question.cde.tinyId).then(function (newCde) {
            var cdeUrl = currentQuestion.question.cde.tinyId +
                (currentQuestion.question.cde.version ? "/" + currentQuestion.question.cde.version : "");
            $http.get("/debytinyid/" + cdeUrl).then(function (oldCde) {
                $scope.bLabel = !angular.equals(newCde.data.naming, oldCde.data.naming);
            });
            var found = false;
            newCde.data.naming.forEach(function (result) {
                if (result.designation == currentQuestion.label) found = true;
            });
            if (found) newQuestion.label = currentQuestion.label;
        });

        $scope.currentQuestion = currentQuestion;
        $scope.newQuestion = newQuestion;
        $scope.bDatatype = currentQuestion.question.datatype != newQuestion.question.datatype;
        $scope.bUom = !angular.equals(currentQuestion.question.uoms, newQuestion.question.uoms);
        $scope.bDefault = $scope.emptyStringToNull(currentQuestion.question.defaultAnswer)
            != $scope.emptyStringToNull(newQuestion.question.defaultAnswer);
        $scope.bCde = true;
        if (newQuestion.question.datatype === "Number") {
            if (currentQuestion.question.datatype === "Number" &&
                currentQuestion.question.datatypeNumber &&
                newQuestion.question.datatypeNumber) {
                $scope.bNumberMin = currentQuestion.question.datatypeNumber.minValue
                    != newQuestion.question.datatypeNumber.minValue;
                $scope.bNumberMax = currentQuestion.question.datatypeNumber.maxValue
                    != newQuestion.question.datatypeNumber.maxValue;
            } else {
                $scope.bNumberMin = $scope.bNumberMax = true;
            }
        }
        if (newQuestion.question.datatype === "Value List") {
            if (currentQuestion.question.datatype === "Value List") {
                $scope.bMulti = currentQuestion.question.multiselect != newQuestion.question.multiselect;
                $scope.bValuelist = !angular.equals(currentQuestion.question.cde.permissibleValues,
                    newQuestion.question.cde.permissibleValues);
                if (!$scope.bValuelist) newQuestion.question.answers = currentQuestion.question.answers;
            } else {
                $scope.bMulti = $scope.bValuelist = true;
            }
        }
    }
]);
