angular.module('formModule').controller('CreateFormFromBoardModalCtrl',
    ['$scope', '$controller', '$location', '$timeout', '$uibModalInstance', 'board', 'userResource', 'Form', '$http',
    function ($scope, $controller, $location, $timeout, $modalInstance, board, userResource, Form, $http) {
        $scope.elt = board;
        $scope.elt.stewardOrg = {};
        $scope.elt.naming = [{designation: board.name}];
        $scope.elt.classification = [];
        $scope.elt.formElements = [{
            elementType: 'section',
            label: "",
            formElements: []
        }];

        $scope.myOrgs = userResource.userOrgs;
        $controller('CreateFormAbstractCtrl', {$scope: $scope});

        $scope.save = function () {
            $http.get('/board/' + board._id + "/0/500").then(function onSuccess(response) {
                response.data.elts.forEach(function (p) {
                    $scope.elt.formElements[0].formElements.push({
                        elementType: 'question',
                        label: p.naming[0].designation,
                        formElements: [],
                        question: {
                            cde: {
                                tinyId: p.tinyId,
                                name: p.naming[0].designation,
                                version: p.version ? p.version : null,
                                permissibleValues: p.valueDomain.permissibleValues,
                                ids: p.ids
                            }
                        }
                    });
                });
                delete $scope.elt._id;
                Form.save($scope.elt, function (form) {
                    $modalInstance.close();
                    $timeout(function () {
                        $location.url("formView?tinyId=" + form.tinyId);
                    }, 0);
                });
            });
        };
    }
]);