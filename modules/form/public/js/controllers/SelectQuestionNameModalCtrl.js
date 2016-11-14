angular.module('formModule').controller('SelectQuestionNameModalCtrl',
    ['$scope', '$uibModalInstance', '$http', 'SkipLogicUtil', 'question', 'section',
        function ($scope, $modalInstance, $http, SkipLogicUtil, question, section) {

            var cde = question.question.cde;
            var url = "/debytinyid/" + cde.tinyId;
            if (cde.version) url += "/" + cde.version;
            $http.get(url).success(function (result) {
                $scope.cde = result;
            }).error(function error() {
                $scope.cde = "error";
            });

            function checkAndUpdateLabel(section, selectedNaming, doUpdate) {
                section.formElements.forEach(function (fe) {
                    if (fe.skipLogic && fe.skipLogic.condition) {
                        var tokens = SkipLogicUtil.tokenSplitter(fe.skipLogic.condition);
                        tokens.forEach(function (token, i) {
                            if (i % 2 === 0 && token === question.label) {
                                if (selectedNaming) {
                                    tokens[i] = '"' + selectedNaming + '"';
                                    tokens[i + 2] = '"' + tokens[i + 2] + '"';
                                }
                                $scope.updateSkipLogic = true;
                            }
                        });
                        if (doUpdate) {
                            fe.skipLogic.condition = tokens.join('');
                            fe.updatedSkipLogic = true;
                        }
                    }
                });
            }

            checkAndUpdateLabel(section, null, false);

            $scope.okSelect = function (naming) {
                if (!naming) {
                    $modalInstance.close("");
                    return;
                }
                checkAndUpdateLabel(section, naming.designation, true);
                $modalInstance.close(naming.designation);
            };
        }
    ]);