angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', 'userResource', 'FormQuickBoard'
        , function($scope, $controller, userResource, QuickBoard)
{

    $scope.quickBoard = QuickBoard;
    $scope.module = "form";

    userResource.getPromise().then(function(){
        $scope.search("form");
    });

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
