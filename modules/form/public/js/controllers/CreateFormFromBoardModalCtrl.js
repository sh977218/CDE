angular.module('formModule').controller('CreateFormFromBoardModalCtrl', ['$scope', '$controller', '$location', '$timeout', '$uibModalInstance', 'board', 'userResource', 'Form',
    function ($scope, $controller, $location, $timeout, $modalInstance, board, userResource, Form) {
        $scope.elt = board;
        $scope.elt.stewardOrg = {};
        $scope.elt.naming = [{}];
        $scope.elt.classification = [];
        $scope.elt.formElements = [];
        $scope.myOrgs = userResource.userOrgs;
        $controller('CreateFormAbstractCtrl', {$scope: $scope});
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.save = function () {
            board.pins.forEach(function (p) {
                $scope.elt.formElements.push({
                    elementType: 'question',
                    label: p.deName,
                    question: {
                        cde: {
                            tinyId: p.deTinyId,
                            version: p.cde.version ? p.cde.version : '',
                            permissibleValues: p.cde.valueDomain.permissibleValues,
                            ids: p.cde.ids

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

        }
    }
]);