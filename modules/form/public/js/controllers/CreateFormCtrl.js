angular.module('formModule').controller('CreateFormCtrl', ['$scope', '$window', '$timeout', '$uibModal', 'Form', '$location', '$controller',
    function ($scope, $window, $timeout, $modal, Form, $location, $controller) {

        $scope.elt = {
            classification: [], stewardOrg: {}, naming: [{
                designation: "", definition: "", tags: []
            }]
        };

        $controller('CreateFormAbstractCtrl', {$scope: $scope});
        $scope.openFormInNewTab = true;

        $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
            if (!$scope.saving && oldUrl.indexOf("createForm") > -1) {
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
                $location.url("formView?tinyId=" + form.tinyId);
            });
        };

        $scope.redirectToHome = function () {
            window.location.href = "/";
        };

    }]);