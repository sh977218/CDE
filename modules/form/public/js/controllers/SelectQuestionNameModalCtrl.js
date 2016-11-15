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

            function checkAndUpdateLabel(section, doUpdate, selectedNaming) {
                section.formElements.forEach(function (fe) {
                    if (fe.skipLogic && fe.skipLogic.condition) {
                        var updateSkipLogic = false;
                        var tokens = SkipLogicUtil.tokenSplitter(fe.skipLogic.condition);
                        tokens.forEach(function (token, i) {
                            if (i % 2 === 0 && token === question.label) {
                                $scope.updateSkipLogic = true;
                                updateSkipLogic = true;
                                if (doUpdate && selectedNaming)
                                    tokens[i] = '"' + selectedNaming + '"';
                            } else if (i % 2 === 0 && token !== question.label)
                                tokens[i] = '"' + tokens[i] + '"';
                        });
                        if (doUpdate && updateSkipLogic) {
                            fe.skipLogic.condition = tokens.join('');
                            fe.updatedSkipLogic = true;
                        }
                    }
                });
            }

            checkAndUpdateLabel(section);

            $scope.okSelect = function (naming) {
                if (!naming) {
                    return $modalInstance.close("");
                }
                checkAndUpdateLabel(section, true, naming.designation);
                $modalInstance.close(naming.designation);
            };
        }
    ]);