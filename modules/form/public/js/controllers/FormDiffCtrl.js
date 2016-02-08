angular.module('formModule').controller('FormDiffCtrl', ['$scope', 'PriorForms',
    function ($scope, PriorForms) {

        var loadPriorForms = function () {
            if (!$scope.priorForms) {
                if ($scope.elt.history && $scope.elt.history.length > 0) {
                    PriorForms.getForms({formId: $scope.elt._id}, function (forms) {
                        $scope.priorForms = forms;
                    });
                }
            }
        };

        $scope.$on('loadPriorForms', loadPriorForms);

    }]);