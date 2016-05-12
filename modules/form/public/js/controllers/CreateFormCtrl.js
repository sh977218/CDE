angular.module('formModule').controller('CreateFormCtrl', ['$scope', '$window', '$timeout', '$uibModal', 'Form', '$location', '$controller',
    function ($scope, $window, $timeout, $modal, Form, $location, $controller) {

        $scope.elt = {
            classification: [], stewardOrg: {}, naming: [{
                designation: "", definition: "", context: {
                    contextName: "Health"
                    , acceptability: "preferred"
                }
            }]
        };

        $controller('CreateFormAbstractCtrl', {$scope: $scope});
        $scope.openFormInNewTab = true;
        
    }]);