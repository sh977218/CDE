var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
angular.module("printModule", ['systemModule', 'cdeModule', 'formModule', 'articleModule'])
    .controller('PrintCtrl',
        ['$scope', '$http', '$q', 'Form', 'userResource', 'isAllowedModel',
            function ($scope, $http, $q, Form, userResource, isAllowedModel) {

                function fetchWholeForm(form, callback) {
                    var maxDepth = 8;
                    var depth = 0;
                    var loopFormElements = function (form, cb) {
                        depth++;
                        if (form.formElements) {
                            async.forEach(form.formElements, function (fe, doneOne) {
                                if (fe.elementType === 'form') {
                                    if (depth < maxDepth) {
                                        $http.get('/formByTinyIdAndVersion/' + fe.inForm.form.tinyId + '/' + fe.inForm.form.version)
                                            .then(function (result) {
                                                fe.formElements = result.data.formElements;
                                                loopFormElements(fe, function () {
                                                    depth--;
                                                    doneOne();
                                                });
                                            });
                                    }
                                    else doneOne();
                                } else if (fe.elementType === 'section') {
                                    loopFormElements(fe, function () {
                                        doneOne();
                                    });
                                } else {
                                    doneOne();
                                }
                            }, function doneAll() {
                                cb();
                            });
                        }
                        else {
                            cb();
                        }
                    };
                    loopFormElements(form, function () {
                        callback(form);
                    });
                }

                $scope.deferredEltLoaded = $q.defer();
                var query = {formId: getUrlParameter("tinyId"), type: 'tinyId'};

                Form.get(query, function (form) {
                    var formCopy = angular.copy(form);
                    fetchWholeForm(formCopy, function (wholeForm) {
                        $scope.elt = wholeForm;
                        if (exports.hasRole(userResource.user, "FormEditor")) {
                            isAllowedModel.setCanCurate($scope);
                        }
                        $scope.formCdeIds = exports.getFormCdes($scope.elt).map(function (c) {
                            return c.tinyId;
                        });
                        isAllowedModel.setDisplayStatusWarning($scope);
                        //setDefaultValues();
                        $scope.deferredEltLoaded.resolve();
                        $scope.formElements = [];
                        $scope.formElement = wholeForm;
                    });
                }, function () {
                    $scope.addAlert("danger", "Sorry, we are unable to retrieve this element.");
                });
            }]);