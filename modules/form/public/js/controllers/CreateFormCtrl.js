angular.module('formModule').controller('CreateFormCtrl', ['$scope', '$window', '$timeout', '$uibModal', 'Form', '$location', '$controller',
    function ($scope, $window, $timeout, $modal, Form, $location, $controller) {

        $scope.elt = {
            classification: [], stewardOrg: {}, naming: [{
                designation: "", definition: "", context: {
                    contextName: ""
                    , acceptability: "preferred"
                }
            }]
        };

        $controller('CreateFormAbstractCtrl', {$scope: $scope});
        $scope.openFormInNewTab = true;

        $scope.$on('$locationChangeStart', function (event) {
            if (!$scope.saving) {
                var txt = "You have unsaved changes, are you sure you want to leave this page? ";
                if (window.debugEnabled) {
                    txt = txt + window.location.pathname;
                }
                var answer = confirm(txt);
                if (!answer) {
                    event.preventDefault();
                }
            }
        });

        $scope.save = function () {
            $scope.saving = true;
            Form.save($scope.elt, function (form) {
                delete $scope.saving;
                $location.url("formView?tinyId=" + form.tinyId);
            });
        };
        
    }]);