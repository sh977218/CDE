angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', 'userResource', 'FormQuickBoard', '$timeout'
        , function($scope, $controller, userResource, QuickBoard, $timeout)
{

    $scope.quickBoard = QuickBoard;
    $scope.module = "form";

    $timeout(function() {
        $scope.search("form");
    }, 0);

    var findFormQuestionNr = function (fe) {
        var n = 0;
        if (fe.formElements != undefined) {
            fe.formElements.forEach(function (e) {
                if (e.elementType && e.elementType === 'question') n++;
                else n = n + findFormQuestionNr(e);
            })
        }
        return n;
    };

    $scope.localEltTransform = function(elt) {
        elt.numQuestions = findFormQuestionNr(elt);
    };

    $scope.exporters.odm = {id: "odmExport", display: "ODM Export"};

}]);
