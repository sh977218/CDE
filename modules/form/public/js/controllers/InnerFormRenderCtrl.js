angular.module('formModule').controller('InnerFormRenderCtrl', ['$scope', '$http',
    function ($scope, $http) {

        $scope.innerForm = $scope.$parent.innerForm;
        $http.get('/formbytinyid/' + $scope.innerForm.form.formTinyId + '/' + $scope.innerForm.form.formVersion).then(function (result) {
            $scope.elt = result.data;
            delete $scope.elt.attachments;
            delete $scope.elt.classification;
            delete $scope.elt.comments;
            delete $scope.elt.created;
            delete $scope.elt.createdBy;
            delete $scope.elt.history;
            delete $scope.elt.properties;
            delete $scope.elt.registrationState;
            delete $scope.elt.stewardOrg;
        });
    }]);
