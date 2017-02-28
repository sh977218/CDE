angular.module('formModule').controller('FormMergeRequestCtrl',
    ['$scope', '$uibModal', '$http', function ($scope, $modal, $http) {
        $scope.identifyQuestions = function (f1, f2) {
            $modal.open({
                animation: false,
                templateUrl: '/form/public/html/identifyQuestionsModal.html',
                controller: function () {
                },
                resolve: {
                    formSource: function () {
                        return $http.get('/form/' + f1.tinyId);
                    },
                    formTarget: function () {
                        return $http.get('/form/' + f2.tinyId);
                    }
                }
            }).result.then(function () {
            })
        }
    }]);